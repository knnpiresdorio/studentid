import { useState } from 'react';
import { Student, School, MemberType, SchoolType } from '../../../types';

export const useStudentImport = (school: School | null) => {
    const [importData, setImportData] = useState<Partial<Student>[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [isParsing, setIsParsing] = useState(false);

    const parseCSV = (text: string) => {
        setIsParsing(true);
        setErrors([]);

        // Cleanup text (remove BOM and normalize line endings)
        const cleanText = text.replace(/^\ufeff/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lines = cleanText.split('\n').filter(line => line.trim());

        if (lines.length === 0) {
            setErrors(['O arquivo está vazio.']);
            setIsParsing(false);
            return;
        }

        // Detect separator
        const firstLine = lines[0];
        const separators = [',', ';', '\t'];
        const separator = separators.reduce((prev, curr) => {
            const currCount = (firstLine.match(new RegExp(curr === '\t' ? '\\t' : curr, 'g')) || []).length;
            const prevCount = (firstLine.match(new RegExp(prev === '\t' ? '\\t' : prev, 'g')) || []).length;
            return currCount > prevCount ? curr : prev;
        }, ',');

        // Robust CSV line parser
        const splitCSVLine = (line: string, sep: string) => {
            const result = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    if (inQuotes && line[i + 1] === '"') {
                        current += '"';
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === sep && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current.trim());
            return result;
        };

        const headers = splitCSVLine(lines[0], separator).map(h =>
            h.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents for base comparison
        );

        const results: Partial<Student>[] = [];
        const newErrors: string[] = [];

        // Header mapping helper - EXACT MATCH ONLY (ignoring case/accents)
        const getColumnIndex = (target: string) => {
            const normalizedTarget = target.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return headers.findIndex(h => h === normalizedTarget);
        };

        // Strict Required Headers
        const idxFullName = getColumnIndex('Nome');
        const idxCpf = getColumnIndex('CPF');
        const idxRegistration = getColumnIndex('Matricula');
        const idxEmail = getColumnIndex('E-mail');
        const idxBirthDate = getColumnIndex('Nascimento');
        const idxValidUntil = getColumnIndex('Validade');
        const idxCity = getColumnIndex('Cidade');
        const idxState = getColumnIndex('Estado');
        const idxUserType = getColumnIndex('Tipo');

        // Optional Fields
        const idxCourse = getColumnIndex('Curso');

        if (idxFullName === -1 || idxCpf === -1 || idxRegistration === -1 || idxEmail === -1 ||
            idxBirthDate === -1 || idxValidUntil === -1 || idxCity === -1 || idxState === -1 || idxUserType === -1) {
            const missing = [];
            if (idxFullName === -1) missing.push('Nome');
            if (idxCpf === -1) missing.push('CPF');
            if (idxRegistration === -1) missing.push('Matrícula');
            if (idxEmail === -1) missing.push('E-mail');
            if (idxBirthDate === -1) missing.push('Nascimento');
            if (idxValidUntil === -1) missing.push('Validade');
            if (idxCity === -1) missing.push('Cidade');
            if (idxState === -1) missing.push('Estado');
            if (idxUserType === -1) missing.push('Tipo');

            newErrors.push(`Cabeçalhos obrigatórios não encontrados: ${missing.join(', ')}.`);
            setErrors(newErrors);
            setIsParsing(false);
            return;
        }

        const formatDateForDB = (dateStr: string) => {
            if (!dateStr || !dateStr.trim()) return '';
            const cleanStr = dateStr.trim();

            if (cleanStr.includes('/')) {
                const parts = cleanStr.split('/');
                if (parts.length === 3) {
                    let day = parseInt(parts[0]);
                    let month = parseInt(parts[1]);
                    let year = parts[2];
                    if (year.length === 2) year = '20' + year;

                    if (month > 12 && day <= 12) {
                        [day, month] = [month, day];
                    }
                    if (month < 1 || month > 12 || day < 1 || day > 31) return '';
                    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                }
            }

            const date = new Date(cleanStr);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
            return '';
        };

        const processedCpfs = new Set<string>();

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = splitCSVLine(line, separator);

            const fullName = values[idxFullName];
            let cpfInput = values[idxCpf] || '';
            let cpf = cpfInput.replace(/\D/g, '');
            const registrationNumber = values[idxRegistration];
            const email = values[idxEmail];
            const validUntilRaw = values[idxValidUntil];
            const birthDateRaw = values[idxBirthDate];
            const city = values[idxCity];
            const state = values[idxState];
            const userTypeRaw = values[idxUserType];

            const missingFields = [];
            if (!fullName) missingFields.push('Nome');
            if (!cpfInput) missingFields.push('CPF');
            if (!registrationNumber) missingFields.push('Matrícula');
            if (!email) missingFields.push('E-mail');
            if (!birthDateRaw) missingFields.push('Nascimento');
            if (!validUntilRaw) missingFields.push('Validade');
            if (!city) missingFields.push('Cidade');
            if (!state) missingFields.push('Estado');
            if (!userTypeRaw) missingFields.push('Tipo');

            if (missingFields.length > 0) {
                newErrors.push(`Linha ${i + 1}: Dados obrigatórios ausentes (${missingFields.join(', ')}).`);
                continue;
            }

            if (cpf.length !== 11) {
                newErrors.push(`Linha ${i + 1}: CPF inválido (${cpfInput}). Deve ter 11 dígitos.`);
                continue;
            }

            if (processedCpfs.has(cpf)) {
                newErrors.push(`Linha ${i + 1}: CPF duplicado no arquivo (${cpfInput}).`);
                continue;
            }
            processedCpfs.add(cpf);

            const formattedValidUntil = formatDateForDB(validUntilRaw);
            const formattedBirthDate = formatDateForDB(birthDateRaw);

            if (!formattedValidUntil || !formattedBirthDate) {
                newErrors.push(`Linha ${i + 1}: Data em formato inválido (${validUntilRaw} ou ${birthDateRaw}).`);
                continue;
            }

            const student: Partial<Student> = {
                fullName,
                cpf,
                registrationNumber,
                email,
                course: idxCourse !== -1 ? values[idxCourse] : '',
                validUntil: formattedValidUntil,
                birthDate: formattedBirthDate,
                userType: (userTypeRaw.toUpperCase() === 'GESTOR' || userTypeRaw.toUpperCase() === 'ADMIN' ? MemberType.MANAGER : MemberType.STUDENT),
                city,
                state,
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
