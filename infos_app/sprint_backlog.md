# Cronograma de Sprints: Modernização e Expansão UniPass

Este documento detalha o planejamento das próximas sprints de trabalho, focando na estabilização da arquitetura, resolução de débitos técnicos e implementação de features de escala.

---

## 🏃 Sprint 01: Core Architecture & Data Sync (P0)
**Foco:** Estabilizar a fonte de verdade e remover redundâncias de estado.

*   **Refatoração do StoreContext:** Remover `useState` locais que duplicam o cache do React Query.
*   **Migração para useMutation:** Implementar `useMutation` para todas as ações de escrita (Criar Aluno, Editar Parceiro, Deletar Dependente).
*   **Optimistic Updates Nativo:** Configurar o `queryClient` para atualizar a UI instantaneamente via cache, eliminando "flashes" de dados antigos.
*   **Validação de Schema (Zod):** Implementar validação nos formulários de `StudentModal` e `PartnerModal` para evitar erros de runtime.

---

## 🏃 Sprint 02: Modularização & Clean Code (P1)
**Foco:** Decomposição dos "God Components" e extração de lógica.

*   **Decomposição do SchoolManager:** Quebrar o arquivo em sub-componentes: `StudentTable`, `PartnerGrid`, `RequestList`.
*   **Extração de Logic Hooks:** Criar hooks como `useStudentActions`, `useStoreValidation` e `usePartnerSettings`.
*   **Componentes de UI Atômicos:** Padronizar botões, inputs e badges em uma biblioteca interna (`components/ui`) para garantir consistência visual.
*   **Refatoração do Auditoria:** Isolar a lógica de filtros de log em um componente puro e performático.

---

## 🏃 Sprint 03: Enterprise Scale & Performance (P2)
**Foco:** Preparar o sistema para grandes volumes de dados e monitoramento.

*   **Server-side Pagination:** Implementar paginação real via Supabase (limit/offset) para as listagens de Alunos e Logs.
*   **Busca Global Performática:** Mover os filtros de busca para o banco de dados em vez de filtrar no frontend.
*   **Image Optimization:** Implementar thumbnails automáticos para as fotos dos alunos para reduzir o consumo de banda.
*   **Integração de Sentry:** Configurar monitoramento de erros em tempo real para capturar falhas de sincronização ou acessos negados.

---

## 🏃 Sprint 04: UX Premium & Robust Offline
**Foco:** Polimento final e conformidade com requisitos não-funcionais.

*   [x] **PWA Setup Completo:** Implementar Service Workers para garantir que a carteirinha carregue 100% offline mesmo sem cache prévio do navegador.
*   [x] **Dashboard de Métricas para Lojistas:** Finalizar a aba de métricas na `StoreView` com gráficos de ROI e frequência de uso.
*   [x] **Fluxo de Onboarding:** Criar o tour guiado para novos `SchoolAdmin` e `StoreAdmin`.
*   [x] **Review de Acessibilidade:** Ajustar contrastes e navegação via teclado para conformidade total.

---

## 📊 Resumo de Esforço

| Sprint | Complexidade | Risco | Valor de Negócio |
| :--- | :--- | :--- | :--- |
| **01** | Alta | Médio | Crítico (Estabilidade) |
| **02** | Média | Baixo | Alto (Manutenibilidade) |
| **03** | Média | Baixo | Alto (Escalabilidade) |
| **04** | Baixa | Baixo | Médio (Encantamento) |
