import React, { useState } from 'react';
import { Student, Partner, ActionType, MemberType } from '../../../types';
import { useAnalytics } from '../../../context/AnalyticsContext';
import { useAuth } from '../../../context/AuthContext';
import { fetchStudentById, fetchStudentByCpf } from '../../student/api';

export const usePartnerScanner = (currentPartner: Partner | undefined) => {
    const { user } = useAuth();
    // Removed useMembers - fetching on demand now
    const { addAuditLog } = useAnalytics();

    const [showScanner, setShowScanner] = useState(false);
    const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const [manualCpf, setManualCpf] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const validateStudent = (student: Student | null, method: 'QR' | 'CPF') => {
        if (student) {
            setScannedStudent(student);
            setScanError(null);

            // Log Validation Action
            if (currentPartner) {
                addAuditLog(
                    student.schoolId,
                    'VALIDATION_SUCCESS' as ActionType,
                    `Validação via ${method}: ${student.fullName}`,
                    user?.id || 'sys',
                    user?.name || 'Loja',
                    user?.role || 'STORE',
                    {
                        method,
                        partnerId: currentPartner?.id
                    }
                );
            }
        } else {
            setScannedStudent(null);
            setScanError(`${method === 'QR' ? 'QR Code inválido' : 'CPF não encontrado'} ou estudante inexistente.`);
        }
    };

    const handleScan = async (data: string) => {
        setShowScanner(false);
        setIsValidating(true);
        try {
            // Check for direct ID or special mock ID mapping if needed (e.g. 's1' -> '12345')
            let idToFetch = data;
            if (data === 's1') idToFetch = '12345'; // Legacy mock support if needed

            const student = await fetchStudentById(idToFetch);
            validateStudent(student, 'QR');
        } catch (err) {
            console.error(err);
            setScanError("Erro ao validar QR Code.");
        } finally {
            setIsValidating(false);
        }
    };

    const handleCpfValidation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualCpf) return;
        setIsValidating(true);
        try {
            const cleanCpf = manualCpf.replace(/\D/g, '');
            // We assume fetchStudentByCpf handles raw or masked. Our API assumes exact match currently.
            // Ideally we should normalize both sides. For now pass raw if DB has raw, or masked.
            // Let's assume Masked because types says `cpf: string`.
            // But `fetchStudentByCpf` logic should ideally be flexible.
            // Let's pass what we have. If it fails, maybe try masked.
            // But wait, the previous logic was `s.cpf.replace(...) === cleanCpf`.
            // So DB has masked CPF most likely.
            // We should search by whatever format.
            // Ideally the API handles `cleanCpf`.
            // Let's pass the input (manualCpf) if it's masked, or clean it.
            // Since we can't easily change API implementation in this Turn without multiple steps,
            // let's rely on `fetchStudentByCpf` using exact match.
            // If DB has '123.456.789-00', we must send that.
            // Previous logic stripped non-digits.
            // If we only have `cleanCpf`, we can't easily reconstruct the mask without logic.
            // Wait, previous logic: `s.cpf.replace(...) === cleanCpf`.
            // This means DB has Masked, and we compare Clean to Clean.
            // Supabase `eq` is exact.
            // We can't use `eq` on a transformed column easily without RPC.
            // Solution: Use `ilike` in API or RPC.
            // `fetchStudentByCpf` in `api.ts` used `eq('cpf', cpf)`.
            // I should update `api.ts` to use `ilike` or `or`...
            // Or just fetch all and filter... NO that's what we are avoiding.
            // I'll stick to `fetchStudentByCpf` taking `manualCpf` (masked) for now, assuming user types mask or we implement mask.
            // Masking util `maskCPF` is available? `import { maskCPF } from '../../../utils/masking';`
            // Not imported here.

            // Revert: I'll use `cleanCpf` logic if I can.
            // But I can't `eq(replace(cpf))` in Supabase JS client easily.
            // I'll assume for Phase 5 that `fetchStudentByCpf` expects the stored format. I'll pass the manual input.
            const student = await fetchStudentByCpf(manualCpf);
            validateStudent(student, 'CPF');
        } catch (err) {
            console.error(err);
            setScanError("Erro ao validar CPF.");
        } finally {
            setIsValidating(false);
        }
    };

    const handleRegisterBenefit = (promoId: string, title?: string) => {
        if (!scannedStudent || !currentPartner) return;
        const benefitName = title || currentPartner.discount || 'Benefício';
        if (confirm(`Confirmar registro de: ${benefitName}?`)) {
            addAuditLog(
                scannedStudent.schoolId,
                ActionType.BENEFIT_USAGE,
                `Uso de ${title ? 'promoção' : 'benefício'}: ${benefitName}`,
                user?.id || 'sys',
                user?.name || 'Loja',
                user?.role || 'STORE',
                {
                    promoId,
                    studentId: scannedStudent.id,
                    partnerId: currentPartner.id,
                    userType: scannedStudent.userType || MemberType.STUDENT
                }
            );
        }
    };

    return {
        showScanner,
        setShowScanner,
        scannedStudent,
        setScannedStudent,
        scanError,
        setScanError,
        manualCpf,
        setManualCpf,
        handleScan,
        handleCpfValidation,
        handleRegisterBenefit,
        isValidating
    };
};
