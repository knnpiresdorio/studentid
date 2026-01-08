import React, { useState, useRef } from 'react';
import { AppUser, ChangeRequest } from '../../../types';
import { supabase } from '../../../services/supabase';
import { compressImage } from '../../../utils/imageCompression';
import { uploadFile, getSignedUrl } from '../../../services/storage';
import { useEffect } from 'react';
import { useSubmitProfileUpdate } from '../api';

interface UseStudentProfileProps {
    user: AppUser;
    myRequests: ChangeRequest[];
    onRequestChange: (request: Omit<ChangeRequest, 'id' | 'createdAt' | 'status'> & { id?: string }) => Promise<void>;
}

export const useStudentProfile = ({ user, myRequests, onRequestChange }: UseStudentProfileProps) => {
    const [infoModal, setInfoModal] = useState({ isOpen: false, reason: '' });
    const [photoUpdateModal, setPhotoUpdateModal] = useState<{ isOpen: boolean, photoUrl: string | null, file: File | null }>({ isOpen: false, photoUrl: null, file: null });
    const [showPhotoUploadConfirmation, setShowPhotoUploadConfirmation] = useState(false);
    const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [resolvedPhotoUrl, setResolvedPhotoUrl] = useState<string | null>(user.studentData?.photoUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Secure RPC mutation
    const submitProfileUpdate = useSubmitProfileUpdate();

    useEffect(() => {
        const resolveUrl = async () => {
            // Priority: Pending Photo Request > Official Approved Photo
            // This ensures the user sees "what they sent" while waiting for approval.
            const pendingPhotoRequest = myRequests.find(r =>
                (r.type === 'UPDATE_PHOTO' || r.type === 'update_photo')
                && r.status === 'PENDING'
            );

            let currentUrl = pendingPhotoRequest?.payload?.photoUrl || user.studentData?.photoUrl;

            if (!currentUrl) {
                setResolvedPhotoUrl(null);
                return;
            };

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
    }, [user.studentData?.photoUrl, myRequests]);

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
                // Upload to 'documents' bucket. Use getSigned=true to ensure immediate validity if bucket is private.
                const path = `student-updates/${user.studentData.id}`;
                finalPhotoUrl = await uploadFile(photoUpdateModal.file, path, 'documents', true);
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

        console.log('Sending change request using Secure RPC...');

        try {
            await submitProfileUpdate.mutateAsync({
                studentId: user.id, // Auth ID for Profile FK key
                schoolId: user.studentData.schoolId,
                studentName: user.studentData.fullName,
                type: 'UPDATE_PHOTO',
                reason: 'Atualização de foto de perfil', // Fixed reason for photo
                payload: { photoUrl: finalPhotoUrl }
            });

            console.log('Success (RPC), closing modal');
            setPhotoUpdateModal({ isOpen: false, photoUrl: null, file: null });

            // Strict success message
            setSuccessModal({ isOpen: true, message: 'Solicitação Enviada! Se já houver uma pendente, ela foi atualizada.' });
        } catch (error) {
            console.error('Failed to submit request via RPC. Full error:', error);
            // Non-blocking error logging
        }
    };

    const handleInfoUpdateRequest = async () => {
        if (!user.studentData || !infoModal.reason.trim()) return;
        try {
            await submitProfileUpdate.mutateAsync({
                studentId: user.id,
                schoolId: user.studentData.schoolId,
                studentName: user.studentData.fullName,
                type: 'UPDATE_INFO',
                reason: infoModal.reason,
                payload: {}
            });
            setInfoModal({ isOpen: false, reason: '' });
            setSuccessModal({ isOpen: true, message: 'Solicitação de correção enviada!' });
        } catch (error) {
            console.error('Error submitting info update:', error);
        }
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
