# Análise de Débito Técnico: UniPass Digital

Este documento identifica, avalia e propõe um plano de resolução para os débitos técnicos acumulados no desenvolvimento do projeto UniPass.

## 1. Categorias de Débito (Debt Categories)

### Arquitetura e Código (Code Sustainability)
*   **"God Components":** Arquivos como `AdminDashboard.tsx`, `SchoolManager.tsx` e `StoreView.tsx` ultrapassam 1.000 linhas de código, misturando lógica de manipulação de dados, gerenciamento de estado de modais e renderização complexa.
*   **Lógica de Negócio embutida na UI:** Regras críticas (ex: cálculo de expiração de carteirinha, lógica de aprovação de dependentes) estão dentro dos componentes React, dificultando a reutilização e testes unitários.

### Gerenciamento de Estado (State Management)
*   **Modelo Híbrido Redundante:** O sistema utiliza `React Query` para buscar dados, mas imediatamente sincroniza esses dados com um `useState` local no `StoreContext`. 
    *   *Risco:* Desincronização entre o cache da query e o estado local; complexidade desnecessária para manter ambos atualizados.
*   **Uso de MockData como Fallback:** O estado inicial é populado com `MOCK_DATA`, o que pode causar "flash of old data" ou inconsistências se a carga do Supabase falhar ou demorar.

### Escalabilidade (Infrastructure & Scaling)
*   **Falta de Paginação no Lado do Servidor (Server-side Pagination):** As queries atuais buscam todos os estudantes e todos os logs de uma só vez. 
    *   *Impacto:* Degradção de performance exponencial à medida que a base de dados cresce.
*   **Ausência de Validação de Esquema (Data Integrity):** Dependência de tipagem manual no TypeScript sem validação de runtime (ex: Zod/Yup) para entradas de formulários e respostas de API.

### Experiência do Usuário (UX Debt)
*   **Offline "Manual":** A persistência offline depende da lógica de cache do React Query ou estado local, sem um Service Worker (PWA) robusto para garantir que a carteirinha carregue sem internet em qualquer situação.

## 2. Avaliação de Impacto (Impact Assessment)

| Categoria | Impacto na Velocidade | Severidade de Bugs | Risco de Escalabilidade |
| :--- | :--- | :--- | :--- |
| **Arquitetura** | Alto (Manutenção lenta) | Médio | Baixo |
| **Estado** | Médio | Alto (Race conditions) | Médio |
| **Escalabilidade** | Baixo (por enquanto) | Baixo | Crítico |
| **UX/Offline** | Baixo | Baixo | Médio (Frustração do usuário) |

## 3. Matriz de Prioridade (Priority Matrix)

| Urgência / Importância | Alta Importância | Baixa Importância |
| :--- | :--- | :--- |
| **Alta Urgência** | **P0:** Refatorar Gerenciamento de Estado (Remover Bridge useState) | **P2:** Melhorar Feedback Visual de Sync |
| **Baixa Urgência** | **P1:** Decompor God Components e Extrair Logic Hooks | **P3:** Implementação completa de PWA |

## 4. Plano de Resolução (Resolution Plan)

### Fase 1: Padronização de Estado (P0) - *Estimativa: 2-3 dias*
*   Remover os `useState` redundantes do `StoreContext`.
*   Migrar todas as atualizações (Save/Delete/Toggle) para `useMutation`.
*   Implementar `optimisticUpdates` diretamente via cache do `queryClient`.

### Fase 2: Decomposição e Hookificação (P1) - *Estimativa: 1 semana*
*   Criar `hooks` especializados: `useStudentActions`, `useSchoolAdmin`, `usePartnerManager`.
*   Fragmentar dashboards em componentes de domínio menores (ex: `features/admin/components/SchoolList.tsx`).
*   Mover lógica de validação de datas e status para um utilitário de domínio puro.

### Fase 3: Infraestrutura de Dados (P2) - *Estimativa: 3-4 dias*
*   Introduzir paginação nas tabelas de Alunos e Logs.
*   Implementar validação de formulários com Zod para garantir integridade antes do envio ao Supabase.

## 5. Estratégia de Prevenção (Prevention Strategy)

1.  **Limites de Tamanho de Arquivo (Linting):** Configurar regras de lint para alertar quando um componente funcional ultrapassar 300 linhas.
2.  **Arquitetura "Hook-First":** Proibir o uso de `useEffect` para sincronização de dados dentro de componentes de UI; toda lógica de dados deve morar em um hook ou service.
3.  **Code Review Focus:** Focar revisões de código na separação entre "Componentes de Apresentação" (puros) e "Componentes de Conteúdo/Lógica".
4.  **Testes de Regressão:** Iniciar a implementação de testes unitários para a lógica de negócio extraída dos hooks para evitar que refatorações quebrem regras críticas.
