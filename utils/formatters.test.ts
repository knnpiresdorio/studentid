import { describe, it, expect } from 'vitest';
import { formatCPF, formatPhone } from './formatters';

describe('formatters', () => {
    describe('formatCPF', () => {
        it('should format a raw number into CPF mask', () => {
            expect(formatCPF('12345678901')).toBe('123.456.789-01');
        });

        it('should handle partial CPF', () => {
            expect(formatCPF('123')).toBe('123');
            expect(formatCPF('1234')).toBe('123.4');
            expect(formatCPF('1234567')).toBe('123.456.7');
        });

        it('should limit to 14 characters', () => {
            expect(formatCPF('1234567890123456789')).toBe('123.456.789-01');
        });
    });

    describe('formatPhone', () => {
        it('should format a raw number into Phone mask', () => {
            expect(formatPhone('11988887777')).toBe('(11) 98888-7777');
        });

        it('should handle partial phone', () => {
            expect(formatPhone('1')).toBe('(1');
            expect(formatPhone('11')).toBe('(11');
            expect(formatPhone('119')).toBe('(11) 9');
        });

        it('should limit to 15 characters', () => {
            expect(formatPhone('1198888777788889999')).toBe('(11) 98888-7777');
        });
    });
});
