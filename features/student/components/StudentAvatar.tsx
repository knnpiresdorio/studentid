import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStudentById } from '../api';

interface StudentAvatarProps {
    studentId?: string;
    className?: string;
    alt?: string;
    fallbackUrl?: string;
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
    studentId,
    className = "w-full h-full object-cover",
    alt = "Student Photo",
    fallbackUrl = "https://via.placeholder.com/100"
}) => {
    const { data: student } = useQuery({
        queryKey: ['student', studentId],
        queryFn: () => studentId ? fetchStudentById(studentId) : Promise.resolve(null),
        enabled: !!studentId,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    return (
        <img
            src={student?.photoUrl || fallbackUrl}
            className={className}
            alt={alt}
        />
    );
};
