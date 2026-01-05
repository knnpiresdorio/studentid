import React, { useState, useRef } from 'react';
import { AppUser, ChangeRequest, Student } from '../../../types';

interface UseStudentProfileProps {
    user: AppUser;
    onRequestChange: (request: Omit<ChangeRequest, 'id' | 'createdAt' | 'status'>) => void;
}

export const useStudentProfile = ({ user, onRequestChange }: UseStudentProfileProps) => {
    const [infoModal, setInfoModal] = useState({ isOpen: false, reason: '' });
    const [photoUpdateModal, setPhotoUpdateModal] = useState<{ isOpen: boolean, photoUrl: string | null }>({ isOpen: false, photoUrl: null });
    const [showPhotoUploadConfirmation, setShowPhotoUploadConfirmation] = useState(false);
    const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleProfilePhotoUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoUpdateModal({ isOpen: true, photoUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const confirmPhotoUpdate = () => {
        if (!user.studentData || !photoUpdateModal.photoUrl) return;

        onRequestChange({
            schoolId: user.studentData.schoolId,
            studentId: user.studentData.id,
            studentName: user.studentData.fullName,
            type: 'UPDATE_PHOTO',
            reason: 'Atualização de foto de perfil',
            payload: { photoUrl: photoUpdateModal.photoUrl }
        });

        setPhotoUpdateModal({ isOpen: false, photoUrl: null });
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
        handleInfoUpdateRequest
    };
};
