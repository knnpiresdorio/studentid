import React, { createContext, useContext, ReactNode } from 'react';
import { Student, School, ChangeRequest } from '../types';
import {
    useSchoolsQuery,
    useChangeRequestsQuery,
    useUpsertStudentMutation,
    useDeleteStudentMutation,
    useUpsertSchoolMutation,
    useUpsertChangeRequestMutation
} from '../hooks/useSupabaseQuery';

interface MemberContextType {
    schools: School[];
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
    const { data: schools = [], isLoading: loadingSchools, error: errorSchools } = useSchoolsQuery();
    const { data: changeRequests = [], isLoading: loadingReq, error: errorReq } = useChangeRequestsQuery();

    const upsertStudentMutation = useUpsertStudentMutation();
    const deleteStudentMutation = useDeleteStudentMutation();
    const upsertSchoolMutation = useUpsertSchoolMutation();
    const upsertChangeRequestMutation = useUpsertChangeRequestMutation();

    const isLoading = loadingSchools || loadingReq;
    const error = errorSchools || errorReq;

    const upsertStudent = (student: Student) => upsertStudentMutation.mutate(student);
    const deleteStudent = (id: string) => deleteStudentMutation.mutate(id);
    const upsertSchool = (school: School) => upsertSchoolMutation.mutate(school);
    const createChangeRequest = (request: ChangeRequest) => upsertChangeRequestMutation.mutate(request);

    return (
        <MemberContext.Provider value={{
            schools,
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
