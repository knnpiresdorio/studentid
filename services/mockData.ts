
import { Partner, School, SchoolType, Student, AppUser, UserRole, ChangeRequest, AuditLog, ActionType } from '../types';

export const MOCK_SCHOOLS: School[] = [
  {
    id: 'sch1',
    name: 'Tech Future Academy',
    logoUrl: 'https://picsum.photos/100/100?random=99',
    type: SchoolType.PROFESSIONAL,
    isActive: true,
    description: 'Transformando futuros através da tecnologia e inovação.',
    createdAt: '2023-01-15'
  },
  {
    id: 'sch2',
    name: 'Instituto de Idiomas Global',
    logoUrl: 'https://picsum.photos/100/100?random=98',
    type: SchoolType.LANGUAGE,
    isActive: true,
    description: 'Conectando você ao mundo através dos idiomas.',
    createdAt: '2023-06-20'
  }
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 's1',
    schoolId: 'sch1',
    fullName: 'Ana Silva',
    cpf: '123.456.789-00',
    photoUrl: 'https://picsum.photos/200/200?random=1',
    schoolName: 'Tech Future Academy',
    schoolType: SchoolType.PROFESSIONAL,
    course: 'Desenvolvimento Fullstack',
    registrationNumber: '2024.1.0045',
    validUntil: '2025-12-31',
    isActive: true,
    birthDate: '1998-05-15',
    isDependent: false,
    dependents: [
      {
        id: 'd1',
        name: 'João Silva',
        cpf: '987.654.321-99',
        relation: 'Filho',
        birthDate: '2018-03-10',
        photoUrl: 'https://picsum.photos/200/200?random=50'
      }
    ]
  },
  {
    id: 's2',
    schoolId: 'sch2',
    fullName: 'Carlos Oliveira',
    cpf: '456.789.123-11',
    photoUrl: 'https://picsum.photos/200/200?random=2',
    schoolName: 'Instituto de Idiomas Global',
    schoolType: SchoolType.LANGUAGE,
    course: 'Inglês Avançado',
    registrationNumber: 'LANG-8821',
    validUntil: '2024-06-30',
    isActive: false, // Inactive example
    birthDate: '2001-11-20',
    isDependent: false,
    dependents: []
  },
  // Data for the Dependent User (d1)
  {
    id: 'd1',
    schoolId: 'sch1',
    fullName: 'João Silva',
    cpf: '987.654.321-99',
    photoUrl: 'https://picsum.photos/200/200?random=50',
    schoolName: 'Tech Future Academy', // Inherited
    schoolType: SchoolType.PROFESSIONAL, // Inherited
    course: 'Dependente (Filho)',
    registrationNumber: '2024.1.0045-D1',
    validUntil: '2025-12-31',
    isActive: true,
    birthDate: '2018-03-10',
    isDependent: true,
    parentName: 'Ana Silva',
    dependents: [] // Dependents cannot have dependents
  }
];

export const MOCK_PARTNERS: Partner[] = [
  {
    id: 'p1',
    schoolId: 'sch1',
    name: 'Livraria Cultura & Saber',
    category: 'Livros e Papelaria',
    discount: '15% OFF',
    description: 'Desconto em todos os livros técnicos e materiais escolares.',
    bannerUrl: 'https://picsum.photos/400/200?random=10',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    state: 'SP',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    activePromotions: [
      { id: 'promo1', title: 'Compre 2 leve 3 em cadernos', limit: 'UNLIMITED' },
      { id: 'promo2', title: 'Semana da Engenharia: 20% OFF', limit: 'MONTHLY' }
    ],
    isActive: false
  },
  {
    id: 'p2',
    schoolId: 'sch1',
    name: 'Academia BodyFit',
    category: 'Saúde e Esporte',
    discount: 'Isenção de Matrícula',
    description: 'A melhor estrutura para o seu treino. Musculação e aulas coletivas.',
    bannerUrl: 'https://picsum.photos/400/200?random=11',
    address: 'Rua do Fitness, 500',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png',
    activePromotions: [
      { id: 'promo3', title: 'Aulas experimentais grátis', limit: 'ONCE' },
      { id: 'promo4', title: 'Avaliação física gratuita', limit: 'ONCE' }
    ],
    instagramUrl: 'https://instagram.com',
    isActive: false
  },
  {
    id: 'p3',
    schoolId: 'sch1',
    name: 'Burger King',
    category: 'Alimentação',
    discount: 'Combo por R$ 19,90',
    description: 'Apresente sua carteirinha e garanta preços especiais.',
    address: 'Shopping Center',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/732/732217.png',
    activePromotions: [
      { id: 'promo5', title: 'Batata média grátis na compra de refrigerante', limit: 'MONTHLY' }
    ],
    tiktokUrl: 'https://tiktok.com',
    isActive: false
  },
  {
    id: 'p4',
    city: 'São Paulo',
    state: 'SP',
    activePromotions: [
      { id: 'promo6', title: 'Aulas de Yoga grátis às terças', limit: 'UNLIMITED' }
    ],
    schoolId: '',
    name: '',
    category: '',
    discount: '',
    description: '',
    logoUrl: '',
    address: '',
    isActive: false
  }
];

export const MOCK_USERS: AppUser[] = [
  {
    id: 'u1',
    username: 'aluno',
    role: UserRole.STUDENT,
    name: 'Ana Silva',
    studentData: MOCK_STUDENTS[0]
  },
  {
    id: 'u2',
    username: 'loja',
    role: UserRole.STORE,
    name: 'Caixa da Loja' // Staff apenas valida
  },
  {
    id: 'u6',
    username: 'admin.loja',
    role: UserRole.STORE_ADMIN,
    name: 'Dono da Loja' // Gerente edita e visualiza
  },
  {
    id: 'u3',
    username: 'admin',
    role: UserRole.ADMIN,
    name: 'Super Admin'
  },
  // Dependent User Login
  {
    id: 'u4',
    username: 'joao.dependente',
    role: UserRole.STUDENT,
    name: 'João Silva (Dep)',
    studentData: MOCK_STUDENTS[2]
  },
  // School Admin User (New)
  {
    id: 'u5',
    username: 'admin.escola',
    role: UserRole.SCHOOL_ADMIN,
    name: 'Diretor Escolar',
    schoolId: 'sch1' // Linked to Tech Future Academy
  }
];

export const MOCK_CHANGE_REQUESTS: ChangeRequest[] = [
  {
    id: 'req1',
    schoolId: 'sch1',
    studentId: 's1',
    studentName: 'Ana Silva',
    type: 'DELETE_DEPENDENT',
    status: 'PENDING',
    reason: 'Mudança de estado civil',
    dependentId: 'd1',
    dependentName: 'João Silva',
    createdAt: '2023-10-25T10:00:00Z'
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log1',
    schoolId: 'sch1',
    actorId: 'u1',
    actorName: 'Ana Silva',
    actorRole: UserRole.STUDENT,
    action: ActionType.LOGIN,
    targetStudent: 'Ana Silva',
    details: 'Acesso realizado via App',
    metadata: {
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Mobile)'
    },
    timestamp: '2023-10-25T09:00:00Z'
  }
];
