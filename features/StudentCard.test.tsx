import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudentCard } from './StudentCard';
import { Student, SchoolType, MemberType } from '../types';

const mockStudent: Student = {
    id: 'test-id',
    schoolId: 'school-1',
    fullName: 'John Doe',
    cpf: '123.456.789-01',
    photoUrl: 'https://example.com/photo.jpg',
    schoolName: 'Test School',
    schoolType: SchoolType.UNIVERSITY,
    course: 'Computer Science',
    registrationNumber: '2023001',
    validUntil: '2026-12-31',
    isActive: true,
    birthDate: '2000-01-01',
    dependents: [],
    userType: MemberType.STUDENT
};

describe('StudentCard', () => {
    it('renders front side correctly', () => {
        render(<StudentCard student={mockStudent} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
        expect(screen.getByText('123.456.789-01')).toBeInTheDocument();
        expect(screen.getByText('ATIVO')).toBeInTheDocument();
    });

    it('flips to back side on click', () => {
        render(<StudentCard student={mockStudent} />);

        const card = screen.getByText('John Doe').closest('.group');
        if (!card) throw new Error('Card not found');

        fireEvent.click(card);

        expect(screen.getByText('Validação Digital')).toBeInTheDocument();
        expect(screen.getByText('TEST-ID')).toBeInTheDocument();
    });

    it('shows INATIVO status when student is inactive', () => {
        render(<StudentCard student={{ ...mockStudent, isActive: false }} />);
        expect(screen.getByText('INATIVO')).toBeInTheDocument();
    });
});
