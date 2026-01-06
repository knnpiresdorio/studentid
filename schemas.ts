import { z } from 'zod';
import { SchoolType, MemberType, PromotionUsageLimit } from './types';

export const dependentSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, 'Nome do dependente é obrigatório'),
    relation: z.string().min(1, 'Grau de parentesco é obrigatório'),
    cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00').optional().or(z.literal('')),
    birthDate: z.string().min(1, 'Data de nascimento é obrigatória').optional().or(z.literal('')),
    photoUrl: z.string().url('URL da foto inválida').optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    isActive: z.boolean().optional(),
});

export const studentSchema = z.object({
    id: z.string().optional(),
    fullName: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
    cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00'),
    photoUrl: z.string().url('URL da foto inválida').or(z.literal('')),
    schoolId: z.string().min(1, 'Instituição é obrigatória'),
    schoolName: z.string().optional(), // Often derived
    schoolType: z.nativeEnum(SchoolType).optional(), // Often derived
    course: z.string().optional().or(z.literal('')),
    registrationNumber: z.string().min(1, 'Matrícula é obrigatória'),
    validUntil: z.string().min(1, 'Data de validade é obrigatória'),
    birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
    isActive: z.boolean(),
    userType: z.nativeEnum(MemberType).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    dependents: z.array(dependentSchema).optional(),
    isDependent: z.boolean().optional(),
    parentName: z.string().optional(),
});

export const promotionSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(3, 'Título da promoção é obrigatório'),
    limit: z.enum(['UNLIMITED', 'MONTHLY', 'ONCE'] as const),
    description: z.string().optional(),
    validUntil: z.string().optional(),
    isActive: z.boolean().optional(),
});

export const partnerSchema = z.object({
    id: z.string().optional(),
    schoolId: z.string().min(1, 'Selecione uma instituição vinculada'),
    adminUserId: z.string().optional(),
    name: z.string().min(2, 'O nome da loja deve ter pelo menos 2 caracteres'),
    category: z.string().min(1, 'Categoria é obrigatória'),
    discount: z.string().min(1, 'Desconto é obrigatório'),
    address: z.string().min(5, 'Endereço completo é obrigatório'),
    city: z.string().optional(),
    state: z.string().length(2, 'UF deve ter 2 caracteres').optional(),
    description: z.string().max(500, 'Descrição não pode exceder 500 caracteres'),
    logoUrl: z.string().url('URL da logo inválida'),
    bannerUrl: z.string().url('URL do banner inválida').optional().or(z.literal('')),
    phoneNumber: z.string().regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido (Ex: 11 99999-9999)').optional().or(z.literal('')),
    instagramUrl: z.string().url('URL inválida').optional().or(z.literal('')),
    facebookUrl: z.string().url('URL inválida').optional().or(z.literal('')),
    tiktokUrl: z.string().url('URL inválida').optional().or(z.literal('')),
    socialVisibility: z.object({
        instagram: z.boolean().optional(),
        facebook: z.boolean().optional(),
        tiktok: z.boolean().optional(),
        phone: z.boolean().optional(),
    }).optional(),
    isActive: z.boolean(),
    activePromotions: z.array(promotionSchema).optional(),
});

export const schoolSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3, 'Nome da instituição deve ter pelo menos 3 caracteres'),
    logoUrl: z.string().url('URL da logo inválida'),
    type: z.nativeEnum(SchoolType),
    isActive: z.boolean(),
    description: z.string().optional().or(z.literal('')),
    createdAt: z.string().optional()
});

export type StudentSchema = z.infer<typeof studentSchema>;
export type PartnerSchema = z.infer<typeof partnerSchema>;
export type DependentSchema = z.infer<typeof dependentSchema>;
export type PromotionSchema = z.infer<typeof promotionSchema>;
export type SchoolSchema = z.infer<typeof schoolSchema>;
