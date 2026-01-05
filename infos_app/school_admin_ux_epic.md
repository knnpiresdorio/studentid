# Epic: Gestão Escolar (#school-admin) - UniPass Digital

Este documento detalha as hipóteses de UX, experimentos e métricas de sucesso para o papel do Administrador Escolar dentro da plataforma UniPass.

## 1. If/Then Hypothesis
**Hipótese Central:**
* **Se nós** fornecermos um painel centralizado para gestão de alunos, moderação de solicitações de alteração e monitoramento de parceiros locais,
* **Para** administradores e secretarias de instituições de ensino,
* **Then we will** reduzir o tempo gasto com processos burocráticos de secretaria em 50%, garantindo que a base de dados de alunos e dependentes esteja sempre auditada e atualizada.

## 2. Tiny Acts of Discovery Experiments
Para testar nossas suposições, realizaremos os seguintes experimentos:

* **Experimento 1 (Moderação de Pedidos):** Observar o tempo de resposta para Solicitações de Dependente (`ChangeRequest`). Se o tempo médio for > 48h, implementaremos notificações push/email para o admin.
* **Experimento 2 (Ações em Massa):** Testar a funcionalidade de ativação/desativação em massa. Se os admins continuarem editando alunos um por um (observado via Logs), faremos um tour guiado destacando a seleção de múltiplos registros.
* **Experimento 3 (Auditoria):** Verificar a frequência de acesso à aba "Auditoria". Se for < 5%, entender se os admins confiam nas alterações automáticas ou se a aba está difícil de encontrar.

## 3. Validation Measures
Saberemos que nossa hipótese é válida se, dentro de **30 dias**, observarmos:

* **Quantitative outcome:**
    * **Eficiência:** Média de tempo para aprovação de uma foto ou dependente < 12h úteis.
    * **Adoção:** 100% dos alunos da instituição importados e com status sincronizado.
    * **Auditabilidade:** Zero alterações de dados realizadas sem um registro de auditoria correspondente.

* **Qualitative outcome:**
    * Secretários escolares relatando "alívio" na fila de atendimento presencial para emissão de carteirinhas.
    * Percepção de "controle total" sobre quem tem acesso aos benefícios da escola.

* **Business outcome:**
    * Aumento no NPS (Net Promoter Score) das instituições parceiras para > 80.
    * Retenção de 100% dos contratos escolares no primeiro semestre.

## 4. Success Criteria

* **Minimum success threshold (Mínimo):**
    * Fluxo de `ChangeRequest` funcionando sem bugs críticos de sincronização DB.
    * Lista de alunos carregando em < 2s para bases de até 1000 registros.

* **Target success metrics (Meta):**
    * Redução de 70% na necessidade de suporte técnico para "correção de CPF ou nome".
    * Pelo menos 20% dos parceiros locais sugeridos ou gerenciados diretamente pela escola.

* **Stretch goals (Desejável):**
    * Integração automática com sistemas de gestão acadêmica (ERP) via API, eliminando a importação manual.
    * Dashboard de "Impacto Social": Ver economia total gerada para seus alunos via Clube de Vantagens.

---

## 5. Mapeamento de Comunicação (Technical Context)

### Pontos de Entrada e Saída de Dados
* **Interface:** `SchoolManager.tsx` — Painel administrativo da unidade.
* **Fluxos de Moderação:** `handleResolveRequest` — Processa `APPROVE/REJECT` e sincroniza mudanças nas tabelas `students` e `dependents`.
* **Sincronização de Status:** Lógica de "Cascata" (Pai Inativo -> Filho Inativo) e "Reversa" (Filho Editado -> Atualiza no Pai) implementada via `handleToggleStatus` e `handleToggleDependentStatus`.
* **Auditoria:** `addAuditLog` registra todas as ações críticas (CRUD, Status, Senhas).

### Componentes de Diálogo
* `StudentModal.tsx`: CRUD completo de alunos e dependentes.
* `PartnerModal.tsx`: Gestão de parceiros e criação de usuários `STORE_ADMIN`.
* `DeleteConfirmationModal.tsx`: Proteção contra deleções acidentais.
