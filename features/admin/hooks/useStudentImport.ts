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
        const idxEmail = getColumnIndex(['email', 'e-mail', 'contato']);

        if (idxFullName === -1 || idxCpf === -1 || idxRegistration === -1 || idxEmail === -1) {
            newErrors.push('Cabeçalhos obrigatórios não encontrados. Certifique-se de que o CSV possui colunas para Nome, CPF, Matrícula e Email.');
            setErrors(newErrors);
            setIsParsing(false);
            return;
        }

        const formatDateForDB = (dateStr: string) => {
            if (!dateStr || !dateStr.trim()) return '';

            // Expected format: DD/MM/YYYY
            const parts = dateStr.trim().split('/');
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = parts[1].padStart(2, '0');
                const year = parts[2];
                return `${year}-${month}-${day}`;
            }

            // Fallback: try native Date parsing if it looks like ISO already
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }

            return '';
        };

        const processedCpfs = new Set<string>();

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Basic CSV parsing (handles quotes and chosen separator)
            const regex = new RegExp(`${separator}(?=(?:(?:[^"]*"){2})*[^"]*$)`);
            const values = line.split(regex).map(v => v.trim().replace(/"/g, ''));

            const fullName = values[idxFullName];
            let cpf = values[idxCpf]?.replace(/\D/g, '');
            const registrationNumber = values[idxRegistration];
            const email = values[idxEmail];

            if (!fullName || !cpf || !registrationNumber || !email) {
                newErrors.push(`Linha ${i + 1}: Dados obrigatórios ausentes. (Nome, CPF, Matrícula e Email são necessários)`);
                continue;
            }

            // CPF Validation
            if (cpf.length !== 11) {
                newErrors.push(`Linha ${i + 1}: CPF inválido (${values[idxCpf]}). Deve ter 11 dígitos.`);
                continue;
            }

            // Duplicate detection in CSV
            if (processedCpfs.has(cpf)) {
                newErrors.push(`Linha ${i + 1}: CPF duplicado no arquivo (${values[idxCpf]}).`);
                continue;
            }
            processedCpfs.add(cpf);

            const student: Partial<Student> = {
                fullName,
                cpf,
                registrationNumber,
                email,
                course: idxCourse !== -1 ? values[idxCourse] : '',
                validUntil: idxValidUntil !== -1 ? formatDateForDB(values[idxValidUntil]) : '',
                birthDate: idxBirthDate !== -1 ? formatDateForDB(values[idxBirthDate]) : '',
                userType: (idxUserType !== -1 ? (values[idxUserType] as MemberType) : MemberType.STUDENT),
                city: idxCity !== -1 ? values[idxCity] : '',
                state: idxState !== -1 ? values[idxState] : '',
                isActive: true,
                photoUrl: '',
                schoolId: school?.id || '',
                schoolName: school?.name || '',
                schoolType: school?.type || SchoolType.UNIVERSITY
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
