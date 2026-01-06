import { useState } from 'react';
import { Student, School, MemberType, SchoolType } from '../../../types';

export const useStudentImport = (school: School | null) => {
    const [importData, setImportData] = useState<Partial<Student>[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [isParsing, setIsParsing] = useState(false);

    const parseCSV = (text: string) => {
        setIsParsing(true);
        setErrors([]);

        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length === 0) {
            setErrors(['O arquivo está vazio.']);
            setIsParsing(false);
            return;
        }

        // Detect separator (comma, semicolon, or tab)
        const firstLine = lines[0];
        const separators = [',', ';', '\t'];
        const separator = separators.reduce((prev, curr) => {
            const prevCount = (firstLine.match(new RegExp(prev, 'g')) || []).length;
            const currCount = (firstLine.match(new RegExp(curr, 'g')) || []).length;
            return currCount > prevCount ? curr : prev;
        }, ',');

        const headers = lines[0].split(separator).map(h =>
            h.trim().toLowerCase()
                .replace(/"/g, '')
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        );

        const results: Partial<Student>[] = [];
        const newErrors: string[] = [];

        // Header mapping helper
        const getColumnIndex = (possibleNames: string[]) => {
            return headers.findIndex(h => possibleNames.includes(h));
        };

        const idxFullName = getColumnIndex(['fullname', 'nome', 'nome completo', 'nome_completo']);
        const idxCpf = getColumnIndex(['cpf', 'documento']);
        const idxRegistration = getColumnIndex(['registrationnumber', 'matricula', 'registro', 'id']);
        const idxCourse = getColumnIndex(['course', 'curso', 'serie', 'turma']);
        const idxValidUntil = getColumnIndex(['validuntil', 'validade', 'vencimento']);
        const idxBirthDate = getColumnIndex(['birthdate', 'nascimento', 'data de nascimento', 'data_nascimento']);
        const idxUserType = getColumnIndex(['usertype', 'tipo', 'perfil']);
        const idxCity = getColumnIndex(['city', 'cidade']);
        const idxState = getColumnIndex(['state', 'estado', 'uf']);

        if (idxFullName === -1 || idxCpf === -1 || idxRegistration === -1) {
            newErrors.push('Cabeçalhos obrigatórios não encontrados. Certifique-se de que o CSV possui colunas para Nome, CPF e Matrícula.');
            setErrors(newErrors);
            setIsParsing(false);
            return;
        }

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Basic CSV parsing (handles quotes and chosen separator)
            const regex = new RegExp(`${separator}(?=(?:(?:[^"]*"){2})*[^"]*$)`);
            const values = line.split(regex).map(v => v.trim().replace(/"/g, ''));

            const fullName = values[idxFullName];
            const cpf = values[idxCpf];
            const registrationNumber = values[idxRegistration];

            if (!fullName || !cpf || !registrationNumber) {
                newErrors.push(`Linha ${i + 1}: Dados obrigatórios ausentes.`);
                continue;
            }

            const student: Partial<Student> = {
                fullName,
                cpf,
                registrationNumber,
                course: idxCourse !== -1 ? values[idxCourse] : '',
                validUntil: idxValidUntil !== -1 ? values[idxValidUntil] : '',
                birthDate: idxBirthDate !== -1 ? values[idxBirthDate] : '',
                userType: (idxUserType !== -1 ? (values[idxUserType] as MemberType) : MemberType.STUDENT),
                city: idxCity !== -1 ? values[idxCity] : '',
                state: idxState !== -1 ? values[idxState] : '',
                isActive: true,
                photoUrl: '',
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
