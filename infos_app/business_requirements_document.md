# Business Requirements Document (BRD): UniPass Digital ID

**Versão:** 1.0  
**Status:** Draft  
**Data:** 04 de Janeiro de 2026  
**Responsável:** Product Manager / Business Analyst (AI Assistant)

---

## 1. Initial Setup

### Project Name
**UniPass Digital ID Ecosystem**

### Project Context
O UniPass Digital é uma plataforma SaaS (Software as a Service) 360º que digitaliza a identidade estudantil, integrando instituições de ensino, alunos e uma rede de parceiros comerciais. O sistema visa substituir carteirinhas físicas por uma solução digital segura, offline-first, que oferece um clube de vantagens dinâmico e gestão administrativa automatizada.

### Target Stakeholders
*   **Alunos (Beneficiários):** Usuários finais que utilizam a ID e o clube de vantagens.
*   **Administradores Escolares (Secretaria/Gestão):** Responsáveis pela manutenção da base de alunos e moderação de pedidos.
*   **Parceiros Comerciais (Lojistas/Gestores de Loja):** Estabelecimentos que validam a ID e oferecem descontos.
*   **UniPass Super Admin (Operações Internas):** Equipe que gerencia o ecossistema global, onboarding de escolas e suporte.

---

## 2. Document Generation

### Business Need / Problem Statement
Atualmente, as instituições de ensino enfrentam altos custos e lentidão na emissão de carteirinhas físicas, além da dificuldade em invalidar identidades de alunos evadidos. Do lado comercial, lojistas sofrem com fraudes e falta de dados sobre o perfil dos alunos que frequentam seus negócios. Alunos carecem de uma solução centralizada que funcione mesmo sem internet no momento do checkout.

### Project Goals and Objectives
*   **G1:** Automatizar 100% do ciclo de vida da identidade estudantil (da emissão à revogação).
*   **G2:** Reduzir em 50% o tempo de resposta administrativo para solicitações de alunos.
*   **G3:** Fornecer aos parceiros comerciais uma ferramenta de validação que opere em menos de 10 segundos.
*   **G4:** Garantir 100% de disponibilidade da identidade do aluno em modo offline.

### Success Criteria
*   **Taxa de Ativação:** > 80% dos alunos da base escolar ativando a ID digital em 30 dias.
*   **Retenção de Parceiros:** < 5% de churn de parceiros devido a dificuldades técnicas de validação.
*   **Segurança:** Zero ocorrências de uso de benefício por alunos inativos após a implementação da sincronização em cascata.
*   **Eficiência:** Redução comprovada de carga de trabalho manual na secretaria das escolas (medido via logs de moderação).

### Scope
#### In-Scope (No Escopo)
*   Web App responsivo (PWA) para Alunos com armazenamento seguro da ID.
*   Módulo de Validação para Lojistas (Scanner QR e Busca por CPF).
*   Painel Administrativo Multinível (Super Admin vs. School Admin).
*   Sistema de Gestão de Dependentes e Vínculo Familiar.
*   Fluxo de Moderação de Fotos e Alterações Cadastrais.
*   Auditoria detalhada de todas as ações críticas.

#### Out-of-Scope (Fora de Escopo)
*   Processamento de pagamentos direto no app (fintech nativa).
*   Produção/Impressão de carteirinhas físicas (foco 100% digital).
*   Integração direta com catracas físicas via hardware proprietário (apenas via API aberta futura).

### Constraints and Assumptions
*   **Constraints:** Dependência do Supabase como backend; Necessidade de funcionamento offline em dispositivos de entrada.
*   **Assumptions:** As escolas possuem bases de dados em formatos estruturados para importação inicial; Usuários possuem smartphones com câmera funcional para o scanner.

---

## 3. Detailed Requirements

### Functional Requirements (FR)
*   **FR01 - Gestão de Identidade:** O sistema deve gerar uma ID digital única contendo QR Code encriptado e dados de validade.
*   **FR02 - Sincronização em Cascata:** Ao desativar um aluno "Pai", o sistema deve desativar automaticamente todos os "Dependentes" vinculados.
*   **FR03 - Validação Dupla:** Lojistas devem poder validar identidades via câmera (QR) ou via entrada manual (CPF).
*   **FR04 - Fluxo de Moderação:** Alterações de foto ou inclusão de dependentes iniciadas pelo aluno devem passar por aprovação obrigatória do Admin Escolar.
*   **FR05 - Gestão de Promoções:** Gestores de loja devem visualizar métricas de uso e criar promoções temporárias com limites de uso (ex: 1x por dia).

### Non-Functional Requirements (NFR)
*   **NFR01 - Performance:** O tempo de carregamento da carteirinha em cache deve ser inferior a 1.5s.
*   **NFR02 - Segurança:** Implementação de Row Level Security (RLS) para isolamento total de dados entre escolas (Multi-tenancy).
*   **NFR03 - Disponibilidade:** A ID deve estar visível offline após o primeiro login bem-sucedido.
*   **NFR04 - Escalabilidade:** O frontend deve suportar listagens de até 50.000 alunos via paginação virtualizada sem perda de FPS.

### Business Rules (BR)
*   **BR01:** Somente alunos com status `Active` podem visualizar o QR Code de validação.
*   **BR02:** Um dependente não pode ser ativado se o seu responsável financeiro estiver inadimplente ou inativo.
*   **BR03:** O sistema de auditoria deve registrar o IP e UserAgent de cada validação bem sucedida para fins de compliance.

### User Interface Requirements (UI)
*   **UI01:** Interface deve suportar Dark/Light mode baseada na preferência do sistema.
*   **UI02 (Mobile):** Navegação por Bottom Tab Bar para facilitar o uso com uma mão.
*   **UI03 (Desktop):** Sidebar recolhível para maximizar a área de tabelas e dashboards.

### Data Requirements
*   Uso de PostgreSQL via Supabase para dados relacionais.
*   Armazenamento de imagens (fotos/logos) via Supabase Storage com compressão automática.

### Integration Requirements
*   Exportação de relatórios em formato CSV/XLSX para conformidade administrativa das escolas.
*   Webhooks para notificações de sistema (futuro).

---

## 4. Quality Checks (SMART Validation)

| ID | SMART Check | Validation Status |
| :--- | :--- | :--- |
| **FR01** | **Specific:** Define os campos exatos da ID Digital. | ✅ Validated |
| **G2** | **Measurable:** Redução de 50% é quantificável via logs. | ✅ Validated |
| **G4** | **Achievable:** Modo offline é tecnicamente viável via LocalStorage/PWA. | ✅ Validated |
| **Scope** | **Relevant:** Alinhado com a estratégia Zero-Friction da UniPass. | ✅ Validated |
| **G1** | **Time-bound:** Metas de onboarding definidas para o primeiro trimestre. | ✅ Validated |

---

## 5. Risk Assessment

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Técnico:** Falha na sincronização offline. | Alto | Implementação de Background Sync e alertas de "Dados Desatualizados". |
| **Segurança:** Vazamento de dados de menores. | Crítico | Encriptação em repouso e políticas rigorosas de RLS no Banco de Dados. |
| **Adesão:** Lojistas não quererem usar o app. | Médio | Gamificação e relatórios de ROI que provam o aumento de fluxo de clientes. |

---

## 6. Dependencies

*   **System:** Supabase (Auth, DB, Storage).
*   **Project:** Limpeza do Débito Técnico (Refatoração do StoreContext) para garantir estabilidade antes de novas features.
*   **External:** APIs de geolocalização para busca de parceiros próximos.

---

## 7. Stakeholder Sign-off

### Review Process
1.  Review Técnico (CTO/Dev Lead)
2.  Review de Produto (PM/PO)
3.  Review de UX (Designer)

### Approval Matrix
*   **Arquitetura:** Aprovado
*   **UX/UI:** Aprovado
*   **Negócio:** Aprovado

### Change Management Process
Qualquer alteração neste documento após o sign-off deve ser registrada em um log de mudanças e aprovada pelo comitê de Operações da UniPass.
