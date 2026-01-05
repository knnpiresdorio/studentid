# Product Requirements Document (PRD): Modernização da Arquitetura UniPass Digital

**Versão:** 1.0  
**Status:** Draft  
**Data:** 04 de Janeiro de 2026  
**Responsável:** AI Architecture Lead

---

## 1. Problem Statement

### Current Situation
O sistema UniPass Digital cresceu rapidamente, resultando em uma arquitetura centralizada em "God Components" (componentes gigantes como `AdminDashboard` e `SchoolManager` com mais de 1.200 linhas). O gerenciamento de estado utiliza um modelo híbrido redundante onde o cache do `React Query` é manualmente sincronizado com `useState` locais dentro do `StoreContext`.

### User Pain Points
*   **Desenvolvedores:** Extrema dificuldade em realizar manutenção, adicionar novas funcionalidades ou testar regras de negócio devido à alta complexidade e acoplamento dos arquivos principais.
*   **Administradores de Grandes Escolas:** Lentidão perceptível na renderização de tabelas de alunos e logs, já que o sistema tenta carregar e processar milhares de registros de uma só vez no frontend.

### Business Impact
*   **Velocidade de Desenvolvimento (Time-to-Market):** Novas features demoram mais para serem implementadas e possuem maior risco de introduzir regressões.
*   **Escalabilidade Técnica:** O sistema atual possui um "teto" de performance que impede o onboarding de instituições com dezenas de milhares de alunos sem comprometer a estabilidade do navegador.
*   **Confiabilidade:** O risco de desincronização de dados entre o banco de dados e a UI em condições de rede instáveis é elevado devido ao gerenciamento manual de estado.

---

## 2. Proposed Solution

### Overview
Implementar uma refatoração profunda baseada em padrões modernos de React, movendo a lógica de estado para uma abordagem baseada em cache (Query-First), fragmentando interfaces complexas em componentes atômicos e introduzindo paginação nativa em nível de API.

### User Stories
*   **Como Desenvolvedor,** quero que a lógica de "Excluir Aluno" esteja isolada em um hook, para que eu possa reutilizá-la e testá-la sem precisar renderizar o dashboard inteiro.
*   **Como Admin Escolar,** quero que a lista de 5.000 alunos carregue instantaneamente, visualizando apenas os registros necessários através de paginação.
*   **Como Gestor de Produto,** quero ter visibilidade em tempo real sobre erros de sincronização que os usuários enfrentam através de ferramentas de monitoramento.

### Success Metrics
*   **Redução de Código:** Diminuir o tamanho dos arquivos `AdminDashboard.tsx` e `SchoolManager.tsx` em pelo menos 60%.
*   **Performance:** Reduzir o tempo de *First Meaningful Paint* em listagens grandes (>1k registros) para menos de 800ms.
*   **Estabilidade:** Zero ocorrências de "Estado Desincronizado" (Race Conditions) relatadas após a adoção plena do cache do React Query.

---

## 3. Requirements

### Functional Requirements
*   **RF01 - Estado Autossuficiente:** O sistema deve utilizar o cache do React Query como única fonte de verdade, eliminando `useState` redundantes no `StoreContext`.
*   **RF02 - Paginação Dinâmica:** Tabelas de `students` e `audit_logs` devem suportar busca por página (limit/offset) integrada ao Supabase.
*   **RF03 - Componentização por Domínio:** Decompor interfaces em componentes menores como `StudentTableRow`, `PartnerCardGrid` e `AuditLogFilter`.

### Technical Requirements
*   **RT01 - Optimistic Updates:** Utilizar `useMutation` para garantir que a UI reflita mudanças instantaneamente enquanto o backend processa a requisição.
*   **RT02 - Custom Hooks:** Extrair lógica de manipulação de dados para hooks específicos como `useStudentMutation` e `useAuditQuery`.
*   **RT03 - Error Monitoring:** Integrar Sentry ou SvelteKit-equivalent para captura de exceptions silenciosas.

### Design Requirements
*   Manter a estética premium atual durante a fragmentação dos componentes.
*   Implementar esqueletos de carregamento (Skeleton Screens) para as áreas paginadas.

---

## 4. Implementation

### Dependencies
*   React Query (TanStack Query) v4+ (Já existente, a melhoria é no uso).
*   Supabase Client (Modificar chamadas para suportar Range/Pagination).
*   Ferramenta de Monitoramento (ex: Sentry).

### Timeline (Estimativa)
*   **Semana 1:** Refatoração do `StoreContext` e Migração para React Query puro (P0).
*   **Semana 2:** Extração de Logic Hooks e Decomposição de Componentes (P1).
*   **Semana 3:** Implementação de Paginação e Monitoramento (P2).

### Resources Needed
*   1 Senior Frontend Engineer (Liderança técnica).
*   1 QA Engineer (Foco em testes de regressão de fluxo administrativo).

---

## 5. Risks and Mitigations

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Regressão de Funcionalidades:** Quebrar fluxos críticos de salvamento/deleção. | Alto | Implementar testes unitários para os novos Custom Hooks antes da substituição na UI. |
| **Complexidade de Migração:** Dificuldade em migrar dados em movimento. | Médio | Refatorar um módulo por vez (ex: primeiro Alunos, depois Parceiros). |
| **Latência de Paginação:** Percepção de lentidão ao trocar de página. | Baixo | Implementar prefetching da próxima página em background. |

---
