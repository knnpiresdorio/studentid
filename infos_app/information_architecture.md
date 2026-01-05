# Arquitetura de Informação: UniPass Digital

Este documento consolida a auditoria de conteúdo, fluxos de usuários e estrutura de navegação do sistema UniPass, integrando as visões de Aluno, Escola, Parceiro e Admin.

## 1. Auditoria de Conteúdo (Content Audit)

O ecossistema UniPass é fundamentado em seis entidades core, cada uma com atributos específicos mapeados no código (`types.ts`):

*   **Identidade Estudantil (Student):**
    *   *Dados:* Foto, Nome Completo, CPF, Matrícula, Instituição, Curso, Validade.
    *   *Metadados:* Status de Atividade (Active/Inactive), Vínculo Familiar (Dependents).
*   **Rede de Convênios (Partners):**
    *   *Dados:* Nome, Logo, Banner, Categoria, Desconto Padrão, Endereço, Telefones.
    *   *Dinâmico:* Promoções Ativas (Título, Limite, Validade), Visibilidade Social.
*   **Gestão Institucional (Schools):**
    *   *Dados:* Nome, Logo, Tipo (Universidade/Técnica/etc), Descrição, Data de Onboarding.
*   **Mesa de Moderação (ChangeRequests):**
    *   *Dados:* Tipo de Requerimento (Foto, Dados, Dependente), Payload de Mudança.
    *   *Status:* Pendente, Aprovado, Recusado (com motivo).
*   **Painel de Métricas (Metrics):**
    *   *Dados:* Validações por período, uso de benefícios por escola, tempo de resposta.
*   **Rastro de Segurança (AuditLogs):**
    *   *Dados:* Ator, Papel, Ação, Alvo, Detalhes Técnicos (IP, User Agent), Timestamp.

## 2. Análise de Fluxo do Usuário (User Flow Analysis)

### Jornada do Aluno (#student-role)
`Login` -> `Dashboard (Carteirinha)` -> `Consulta de Benefícios` -> `Uso no PDV` -> `Gestão de Dependentes`.
*   *Ponto Crítico:* Acesso offline imediato à carteirinha.
*   *Funil:* Validação da ID para desbloqueio da economia real.

### Jornada do Administrador Escolar (#school-admin)
`Login` -> `Status da Unidade` -> `Moderação de Reclamações` -> `Gestão de Alunos (Bulk Actions)` -> `Auditoria Local`.
*   *Ponto Crítico:* Sincronização em cascata (Status Ativo/Inativo entre familiares).

### Jornada do Lojista (#store)
`Login` -> `Validação Rápida (Scanner QR/CPF)` -> `Confirmação de Benefício` -> `Análise de Desempenho (Gestor)`.
*   *Ponto Crítico:* Velocidade de resposta no checkout (< 10s).

### Jornada do Super Admin (#admin)
`Login` -> `Dashboard Global` -> `Onboarding de Escola` -> `Monitoramento Multi-tenancy`.
*   *Ponto Crítico:* Visibilidade cross-school e integridade dos dados globais.

## 3. Estrutura de Navegação (Navigation Structure)

O sistema utiliza **Navegação Adaptativa por Contexto/Role**:

*   **Aluno (Mobile-First):** Navegação por Bottom Tab Bar (`identity`, `partners`, `requests`, `family`).
*   **Escola/Admin (Desktop-Focused):** Sidebar persistente com seções de alto nível.
*   **Mecanismo de Profundidade:** Uso intensivo de Modais (`StudentModal`, `PartnerModal`) para CRUD, mantendo o usuário no contexto visual da lista principal.
*   **Navegação Delegada:** O Super Admin possui o fluxo de "Mergulho" (`managedSchool`), onde a interface se adapta para mostrar o contexto de uma única instituição.

## 4. Sistema de Rotulagem (Labeling System)

A UniPass utiliza uma terminologia que equilibra o acadêmico com o comercial:

*   **Carteirinha Digital:** Termo central para Identidade.
*   **Clube de Vantagens:** Branding para a rede de parceiros.
*   **Combo Família:** Conceito de gamificação para slots de dependentes pagos.
*   **Auditoria / Logs:** Termos técnicos para transparência operacional.
*   **Modo Offline:** Indicador de confiança para o aluno.

## 5. Estratégia de Busca (Search Strategy)

*   **Busca Global (Admin):** Indexação por Nome e CPF em tempo real (Fuzzy Search simulada).
*   **Filtros Geográficos (Rede):** Parametrização por Estado -> Cidade -> Categoria.
*   **Filtros de Auditoria:** Segmentação por Tipo de Ação (Login, Deletion, Update).
*   **Smart Search (Student):** Busca no Clube de Vantagens priorizando favoritos e locais próximos.

## 6. Recomendações de Melhoria

1.  **Consistência Cross-Platform:** Tornar a experiência de navegação do `StoreView` mais similar à do `StudentView` em mobile (uso de gestos).
2.  **Feedback de Sincronização:** Adicionar indicadores visuais de "Sincronizando com Supabase" para evitar cliques duplos em conexões lentas.
3.  **Arquitetura de Dados:** Mover metadados de `usage_limit` das promoções para uma tabela dedicada para facilitar BI avançado no futuro.
4.  **Acesso Rápido:** Implementar atalhos (Deep Links) para o Scanner na tela de login dos lojistas selecionados.
5.  **Hierarquia Visual:** No painel de Admin, diferenciar visualmente registros que possuem `ChangeRequests` pendentes para priorizar a triagem.
