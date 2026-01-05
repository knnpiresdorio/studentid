import { useState } from 'react';
import { Student, School, MemberType, SchoolType } from '../../../types';

export const useStudentImport = (school: School | null) => {
    const [importData, setImportData] = useState<Partial<Student>[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [isParsing, setIsParsing] = useState(false);

    const parseCSV = (text: string) => {
        setIsParsing(true);
        setErrors([]);
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

        const results: Partial<Student>[] = [];
        const newErrors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            // Basic CSV parsing (handles quotes)
            const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/"/g, ''));
            const row: any = {};

            headers.forEach((header, index) => {
                row[header] = values[index];
            });

            // Validation & Mapping
            if (!row.fullName || !row.cpf || !row.registrationNumber) {
                newErrors.push(`Linha ${i + 1}: Campos obrigatórios ausentes (Nome, CPF ou Matrícula).`);
                continue;
            }

            const student: Partial<Student> = {
                fullName: row.fullName,
                cpf: row.cpf,
                registrationNumber: row.registrationNumber,
                course: row.course || '',
                validUntil: row.validUntil || '',
                birthDate: row.birthDate || '',
                userType: (row.userType as MemberType) || MemberType.STUDENT,
                city: row.city || '',
                state: row.state || '',
                isActive: true,
                photoUrl: '', // Trigger photo requirement
                schoolId: school?.id || '',
                schoolName: school?.name || '',
                schoolType: school?.type || SchoolType.UNIVERSITY,
                dependents: []
            };

            results.push(student);
        }

        setImportData(results);
        setErrors(newErrors);
        setIsParsing(false);
    };

    const clearImport = () => {
        setImportData([]);
        setErrors([]);
    };

    return {
        importData,
        errors,
        isParsing,
        parseCSV,
        clearImport
    };
};
