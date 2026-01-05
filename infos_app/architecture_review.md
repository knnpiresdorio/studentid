# Revisão Técnica da Arquitetura: UniPass Digital

Este documento apresenta uma análise técnica profunda da arquitetura atual do sistema UniPass, avaliando sua robustez, escalabilidade e pontos de melhoria.

## 1. Análise de Componentes (Component Analysis)

### Estrutura de Camadas
O sistema segue uma arquitetura baseada em **Features** e **Contextos**:
*   **Camada de Provedores (Contexts):** Centraliza estados transversais (`Auth`, `Store`, `Theme`). O `StoreContext` atua como um "Mini-Redux", gerenciando todas as entidades core.
*   **Componentes Inteligentes (Managers):** `AdminDashboard`, `SchoolManager` e `StoreView` concentram grande parte da lógica de negócio e orquestração de formulários.
*   **Componentes Reutilizáveis (Modals/UI):** Boa abstração de modais (`StudentModal`, `PartnerModal`) compartilhados entre diferentes fluxos administrativos.

### Padrão de Estado
Implementa um modelo **Híbrido**:
*   **React Query:** Gerencia o cache e estados de carregamento assíncrono.
*   **Local State Bridge:** Os dados do cache são sincronizados com estados locais (`useState`) para manter compatibilidade com as funções de atualização legadas (`setStudents`, etc.) e permitir atualizações otimistas manuais.

## 2. Avaliação de Escalabilidade (Scalability Assessment)

### Pontos Fortes
*   **Multi-tenancy:** A lógica baseada em `schoolId` e o fluxo de "contexto delegado" (`managedSchool`) permitem que o sistema cresça em número de instituições sem conflito de dados.
*   **Backend as a Service (Supabase):** O uso de PostgreSQL com Supabase garante escalabilidade horizontal na camada de dados.

### Riscos e Gargalos
*   **Carga de Dados no Frontend:** Atualmente, as queries de alunos e parceiros parecem carregar listas completas para o estado local. Para escolas com > 10.000 alunos, isso causará degradação de performance por consumo excessivo de memória e processamento de DOM.
*   **Complexidade de Arquivos:** Componentes com mais de 1.200 linhas (ex: `AdminDashboard.tsx`) tornam a manutenção e o teste unitário extremamente difíceis à medida que novas regras de negócio são adicionadas.

## 3. Revisão de Segurança (Security Review)

### Mecanismos Implementados
*   **RBAC (Role Based Access Control):** Controle de acesso baseado em papéis (`ADMIN`, `SCHOOL_ADMIN`, `STORE`, `STUDENT`) implementado tanto na navegação (`App.tsx`) quanto na renderização condicional de componentes.
*   **Audit Trail:** Uma das maiores forças do sistema. A função `addAuditLog` captura metadados (UserAgent, Actor, Action, Target) para todas as operações críticas, garantindo rastreabilidade total.

### Recomendações de Segurança
*   **RLS (Row Level Security):** É imperativo garantir que as políticas de RLS no Supabase estejam configuradas para evitar que um `SCHOOL_ADMIN` acesse dados de outra escola via manipulação de API/Network.
*   **Sanitização de Inputs:** Reforçar a validação de esquemas (ex: Zod) nos formulários de criação de alunos e instituições.

## 4. Avaliação de Performance (Performance Evaluation)

*   **Atualizações Otimistas:** O sistema já implementa atualizações otimistas manuais na UI antes da confirmação do banco, o que melhora a percepção de velocidade do usuário.
*   **Imagens e Ativos:** Uso intensivo de fotos de alunos e logos. Recomenda-se a implementação de um componente de `ImageLoader` com suporte a resoluções menores (thumbnails) para as listagens de tabela e cards.
*   **Offline Support:** O `StudentView` já possui lógica focada em acesso rápido, mas a implementação de um Service Worker (PWA) fortaleceria o uso offline da carteirinha.

## 5. Pontos de Integração (Integration Points)

*   **Supabase (DB/Auth/Storage):** Integração profunda e eficiente.
*   **Google Sheets (Potencial):** Referências em logs sugerem mapeamento de planilhas para carga inicial de dados.
*   **Scanner QR/CPF:** Ponto de integração crítica entre a identidade física/digital do aluno e o checkout do lojista.

## 6. Recomendações de Melhoria (Improvement Recommendations)

1.  **Refatoração de Estado (React Query puro):** Abandonar o sincronismo com `useState` local e utilizar `useMutation` com manipulação direta de cache para atualizações otimistas. Isso reduzirá o re-render e simplificará o código.
2.  **Fragmentação de "God Components":** Quebrar `AdminDashboard` e `SchoolManager` em componentes menores por domínio (ex: `StudentList`, `SchoolInfoEditor`, `PartnerGrid`).
3.  **Paginação no Lado do Servidor:** Implementar paginação nas queries de `audit_logs` e `students` para suportar crescimento da base de dados.
4.  **Extração de Logic Hooks:** Mover a lógica de ações (delete, save, toggle) para hooks customizados (ex: `useStudentActions`) para limpar a camada visual dos componentes.
5.  **Monitoramento de Erros:** Integrar uma ferramenta de observabilidade (ex: Sentry) para capturar falhas de sincronização com o Supabase em tempo real.
