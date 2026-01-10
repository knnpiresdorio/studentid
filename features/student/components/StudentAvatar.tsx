import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStudentById } from '../api';
import { getSignedUrl } from '../../../services/storage';

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

    const [imgUrl, setImgUrl] = React.useState<string>(fallbackUrl);

    React.useEffect(() => {
        if (student?.photoUrl) {
            if (student.photoUrl.startsWith('http')) {
                setImgUrl(student.photoUrl);
            } else {
                // If it's a path, get a signed URL
                getSignedUrl('avatars', student.photoUrl).then(url => {
                    setImgUrl(url);
                }).catch(() => {
                    setImgUrl(fallbackUrl);
                });
            }
        } else {
            setImgUrl(fallbackUrl);
        }
    }, [student?.photoUrl, fallbackUrl]);

    return (
        <img
            src={imgUrl}
            className={className}
            alt={alt}
        />
    );
};
