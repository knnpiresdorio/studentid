/**
 * Personal Data Masking Utilities (LGPD Compliance)
 */

/**
 * Masks a CPF (Brazilian ID) for privacy.
 * Standard: ***.***.888-99 (Hides first 6 digits)
 */
export const maskCPF = (cpf: string | undefined): string => {
    if (!cpf) return '';
    // Removes non-digits and pads if necessary
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11) return cpf; // Return original if malformed

    return `***.***.${clean.substring(6, 9)}-${clean.substring(9, 11)}`;
};

/**
 * Masks an Email address.
 * Standard: j***@example.com
 */
export const maskEmail = (email: string | undefined): string => {
    if (!email) return '';
    const [user, domain] = email.split('@');
    if (!domain) return email;
    return `${user.charAt(0)}***@${domain}`;
};

/**
 * Masks a Phone number.
 * Standard: (11) 9****-1234
 */
export const maskPhone = (phone: string | undefined): string => {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) return phone;
    const ddd = clean.substring(0, 2);
    const last4 = clean.substring(clean.length - 4);
    return `(${ddd}) ${clean.charAt(2)}****-${last4}`;
};
