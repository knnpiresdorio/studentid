/**
 * Constants
 */
export const BRAZIL_STATES = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

/**
 * Input formatters for data consistency and UX
 */

/**
 * Formats a raw number string into a CPF (000.000.000-00)
 */
export const formatCPF = (value: string): string => {
    const raw = value.replace(/\D/g, '');
    let formatted = raw;

    if (raw.length > 9) {
        formatted = `${raw.substring(0, 3)}.${raw.substring(3, 6)}.${raw.substring(6, 9)}-${raw.substring(9, 11)}`;
    } else if (raw.length > 6) {
        formatted = `${raw.substring(0, 3)}.${raw.substring(3, 6)}.${raw.substring(6, 9)}`;
    } else if (raw.length > 3) {
        formatted = `${raw.substring(0, 3)}.${raw.substring(3, 6)}`;
    }

    return formatted.substring(0, 14);
};

/**
 * Formats a raw number string into a Phone number ((00) 00000-0000)
 */
export const formatPhone = (value: string): string => {
    const raw = value.replace(/\D/g, '');
    let formatted = raw;

    if (raw.length > 10) {
        formatted = `(${raw.substring(0, 2)}) ${raw.substring(2, 7)}-${raw.substring(7, 11)}`;
    } else if (raw.length > 6) {
        formatted = `(${raw.substring(0, 2)}) ${raw.substring(2, 6)}-${raw.substring(6, 10)}`;
    } else if (raw.length > 2) {
        formatted = `(${raw.substring(0, 2)}) ${raw.substring(2)}`;
    } else if (raw.length > 0) {
        formatted = `(${raw}`;
    }

    return formatted.substring(0, 15);
};
