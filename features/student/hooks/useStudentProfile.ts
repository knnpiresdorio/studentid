import React, { useState, useRef } from 'react';
import { AppUser, ChangeRequest } from '../../../types';
import { supabase } from '../../../services/supabase';
import { compressImage } from '../../../utils/imageCompression';

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
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        if (!user.studentData) return;

        // If we have a file, upload it first
        let finalPhotoUrl = photoUpdateModal.photoUrl;

        if (photoUpdateModal.file) {
            setIsUploading(true);
            try {
                const fileExt = photoUpdateModal.file.name.split('.').pop();
                const fileName = `${user.studentData.schoolId}/${user.studentData.id}/${Date.now()}.${fileExt}`;
                const filePath = `student-photos/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('documents')
                    .upload(filePath, photoUpdateModal.file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('documents')
                    .getPublicUrl(filePath);

                finalPhotoUrl = data.publicUrl;

            } catch (error) {
                console.error('Error uploading photo:', error);
                alert('Erro ao enviar a foto. Tente novamente.');
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        if (!finalPhotoUrl) return;

        onRequestChange({
            schoolId: user.studentData.schoolId,
            studentId: user.studentData.id,
            studentName: user.studentData.fullName,
            type: 'UPDATE_PHOTO',
            reason: 'Atualização de foto de perfil',
            payload: { photoUrl: finalPhotoUrl }
        });

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
        isUploading
    };
};
