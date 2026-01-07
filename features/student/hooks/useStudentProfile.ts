import React, { useState, useRef } from 'react';
import { AppUser, ChangeRequest } from '../../../types';
import { supabase } from '../../../services/supabase';
import { compressImage } from '../../../utils/imageCompression';
import { uploadFile, getSignedUrl } from '../../../services/storage';
import { useEffect } from 'react';

interface UseStudentProfileProps {
    user: AppUser;
    onRequestChange: (request: Omit<ChangeRequest, 'id' | 'createdAt' | 'status'>) => void;
}

export const useStudentProfile = ({ user, onRequestChange }: UseStudentProfileProps) => {
    const [infoModal, setInfoModal] = useState({ isOpen: false, reason: '' });
    const [photoUpdateModal, setPhotoUpdateModal] = useState<{ isOpen: boolean, photoUrl: string | null, file: File | null }>({ isOpen: false, photoUrl: null, file: null });
    const [showPhotoUploadConfirmation, setShowPhotoUploadConfirmation] = useState(false);
    const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [resolvedPhotoUrl, setResolvedPhotoUrl] = useState<string | null>(user.studentData?.photoUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const resolveUrl = async () => {
            // Priority: Approved photo > Pending photo update
            let currentUrl = user.studentData?.photoUrl;

            if (!currentUrl) {
                // Check for pending photo request in user context? 
                // Actually, useStudentProfile doesn't have access to all myRequests, only what changed.
                // Wait, I can pass myRequests to this hook if needed, but let's stick to the user object first.
            }

            if (!currentUrl) return;

            // If it's a supabase storage URL for avatars or documents, get a signed one
            if (currentUrl.includes('/avatars/') || currentUrl.includes('/documents/')) {
                try {
                    const bucket = currentUrl.includes('/avatars/') ? 'avatars' : 'documents';
                    const path = currentUrl.split(`/${bucket}/`).pop();
                    if (path) {
                        const signedUrl = await getSignedUrl(bucket, path);
                        setResolvedPhotoUrl(signedUrl);
                    }
                } catch (error) {
                    console.error('Failed to resolve signed URL:', error);
                }
            } else {
                setResolvedPhotoUrl(currentUrl);
            }
        };

        resolveUrl();
    }, [user.studentData?.photoUrl]);

    const handleProfilePhotoUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Compress image before setting state
                const compressedFile = await compressImage(file);

                const reader = new FileReader();
                reader.onloadend = () => {
                    setPhotoUpdateModal({ isOpen: true, photoUrl: reader.result as string, file: compressedFile });
                };
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                console.error('Error compressing image, using original:', error);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPhotoUpdateModal({ isOpen: true, photoUrl: reader.result as string, file });
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const confirmPhotoUpdate = async () => {
        console.log('Starting photo update confirmation...', { studentData: user.studentData, photoFile: photoUpdateModal.file });
        if (!user.studentData) {
            console.warn('Missing studentData, cannot update photo');
            return;
        }

        // If we have a file, upload it first
        let finalPhotoUrl = photoUpdateModal.photoUrl;

        if (photoUpdateModal.file) {
            console.log('Uploading photo file...');
            setIsUploading(true);
            try {
                // Upload to 'documents' bucket as in current implementation, but now using utility with signed URL
                const path = `student-updates/${user.studentData.id}`;
                finalPhotoUrl = await uploadFile(photoUpdateModal.file, path, 'documents', false);
                console.log('Upload successful, URL:', finalPhotoUrl);
            } catch (error) {
                console.error('Error uploading photo:', error);
                alert('Erro ao enviar a foto. Tente novamente.');
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        if (!finalPhotoUrl) {
            console.warn('No photo URL for update request');
            return;
        }

        console.log('Sending change request...');
        onRequestChange({
            schoolId: user.studentData.schoolId,
            studentId: user.studentData.id,
            studentName: user.studentData.fullName,
            type: 'UPDATE_PHOTO',
            reason: 'Atualização de foto de perfil',
            payload: { photoUrl: finalPhotoUrl }
        });

        console.log('Success, closing modal');
        setPhotoUpdateModal({ isOpen: false, photoUrl: null, file: null });
        setSuccessModal({ isOpen: true, message: 'Solicitação de atualização de foto enviada!' });
    };

    const handleInfoUpdateRequest = () => {
        if (!user.studentData || !infoModal.reason.trim()) return;
        onRequestChange({
            schoolId: user.studentData.schoolId,
            studentId: user.studentData.id,
            studentName: user.studentData.fullName,
            type: 'UPDATE_INFO',
            reason: infoModal.reason
        });
        setInfoModal({ isOpen: false, reason: '' });
        setSuccessModal({ isOpen: true, message: 'Solicitação de correção enviada!' });
    };

    return {
        infoModal,
        setInfoModal,
        photoUpdateModal,
        setPhotoUpdateModal,
        showPhotoUploadConfirmation,
        setShowPhotoUploadConfirmation,
        successModal,
        setSuccessModal,
        fileInputRef,
        handleProfilePhotoUpdate,
        confirmPhotoUpdate,
        handleInfoUpdateRequest,
        isUploading,
        resolvedPhotoUrl
    };
};
