import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Student, School, ChangeRequest } from '../types';
import {
    useSchoolsQuery,
    useChangeRequestsQuery,
    useUpsertStudentMutation,
    useDeleteStudentMutation,
    useUpsertSchoolMutation,
    useUpsertChangeRequestMutation,
    usePaginatedStudentsQuery
} from '../hooks/useSupabaseQuery';

interface MemberContextType {
    schools: School[];
    students: Student[];
    changeRequests: ChangeRequest[];
    isLoading: boolean;
    error: any;

    // Mutations / Actions
    upsertStudent: (student: Student) => void;
    deleteStudent: (id: string) => void;
    upsertSchool: (school: School) => void;
    createChangeRequest: (request: ChangeRequest) => void;
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export const MemberProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { data: schools = [], isLoading: loadingSchools, error: errorSchools } = useSchoolsQuery(!!user);
    const { data: students = [], isLoading: loadingStudents, error: errorStudents } = usePaginatedStudentsQuery({ page: 1, pageSize: 1000 }, !!user && user.role === 'ADMIN');
    const { data: changeRequests = [], isLoading: loadingReq, error: errorReq } = useChangeRequestsQuery(!!user);

    const upsertStudentMutation = useUpsertStudentMutation();
    const deleteStudentMutation = useDeleteStudentMutation();
    const upsertSchoolMutation = useUpsertSchoolMutation();
    const upsertChangeRequestMutation = useUpsertChangeRequestMutation();

    const isLoading = loadingSchools || loadingReq || loadingStudents;
    const error = errorSchools || errorReq || errorStudents;

    const upsertStudent = (student: Student) => upsertStudentMutation.mutate(student);
    const deleteStudent = (id: string) => deleteStudentMutation.mutate(id);
    const upsertSchool = (school: School) => upsertSchoolMutation.mutate(school);
    const createChangeRequest = (request: ChangeRequest) => upsertChangeRequestMutation.mutate(request);

    return (
        <MemberContext.Provider value={{
            schools,
            students: students.data || [],
            changeRequests,
            isLoading,
            error,
            upsertStudent,
            deleteStudent,
            upsertSchool,
            createChangeRequest
        }}>
            {children}
        </MemberContext.Provider>
    );
};

export const useMembers = () => {
    const context = useContext(MemberContext);
    if (!context) {
        throw new Error('useMembers must be used within a MemberProvider');
    }
    return context;
};
