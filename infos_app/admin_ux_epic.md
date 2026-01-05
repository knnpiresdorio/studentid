# Epic: Super Admin (#admin) - UniPass Digital

Este documento detalha as hipóteses de UX, experimentos e métricas de sucesso para o papel de Super Admin dentro da plataforma UniPass.

## 1. If/Then Hypothesis
**Hipótese Central:**
* **Se nós** fornecermos um painel de controle global (Single Pane of Glass) que permita a gestão multi-tenancy de instituições, alunos e parceiros,
* **Para** a equipe operacional da UniPass,
* **Então nós vamos** garantir a escalabilidade da plataforma, permitindo o onboarding de novas escolas em minutos, monitorando a saúde do ecossistema em tempo real e garantindo a conformidade via auditoria global.

## 2. Tiny Acts of Discovery Experiments
Para testar nossas suposições, realizaremos os seguintes experimentos:

* **Experimento 1 (Velocidade de Onboarding):** Medir o tempo necessário para cadastrar uma nova escola e emitir a primeira carteirinha. Se for > 15 min, criaremos um assistente (wizard) de configuração.
* **Experimento 2 (Descoberta de Fraude/Anomalias):** Monitorar o uso da aba "Auditoria". Testaremos se filtros por "Ações Críticas" (ex: múltiplas tentativas de login falhas) ajudam o admin a identificar problemas de segurança proativamente.
* **Experimento 3 (UX Multi-School):** Avaliar a frequência com que o Super Admin "entra" na visão de uma escola específica (`managedSchool`). Se for muito alta, moveremos atalhos de ações rápidas (ex: "Aprovar tudo") para o nível global.

## 3. Validation Measures
Saberemos que nossa hipótese é válida se, dentro de **30 dias**, observarmos:

* **Quantitative outcome:**
    * **Operacional:** Tempo para resolver um ticket de suporte complexo (ex: erro de sincronização) reduzido em 30%.
    * **Onboarding:** Redução de 50% no esforço manual para importar bases de dados externas.
    * **Uptime de Dados:** 100% de consistência entre os dados exibidos no Super Admin e nos painéis específicos da escola.

* **Qualitative outcome:**
    * Equipe interna relatando que "não precisa mais acessar o banco de dados diretamente" para resolver 95% das demandas.
    * Sentimento de segurança ao realizar ações em massa (bulk actions) via feedback visual de confirmação.

* **Business outcome:**
    * Capacidade de dobrar o número de escolas parceiras sem necessidade de contratar novos analistas de operações.

## 4. Success Criteria

* **Minimum success threshold (Mínimo):**
    * Todos os CRUDs (Escolas, Alunos, Parceiros) funcionando perfeitamente com auditoria vinculada.
    * Sistema de busca global responsivo para bases de dados de grande escala.

* **Target success metrics (Meta):**
    * Dashboard de "Visão Geral" contendo KPIs de saúde do sistema (Atividade média, Taxa de erros).
    * Zero perda de dados durante processos de edição em massa.

* **Stretch goals (Desejável):**
    * Dashboard de Business Intelligence (BI) integrado, mostrando ROI para cada parceiro e escola.
    * Sistema de alertas automáticos para escolas com baixa taxa de ativação de alunos.

---

## 5. Mapeamento de Comunicação (Technical Context)

### Pontos de Entrada e Saída de Dados
* **Interface:** `AdminDashboard.tsx` — Painel de controle mestre com navegação por seções.
* **Gestão Delegada:** Estado `managedSchool` — Quando ativo, redireciona o contexto dos modais e tabelas para uma instituição específica, permitindo ao Super Admin agir "como" um Admin Escolar.
* **Ações em Massa:** `executeBulkAction` — Lógica centralizada para lidar com múltiplos IDs, garantindo que o estado global seja atualizado de forma consistente.
* **Auditoria Global:** Integração com `addAuditLog` para registrar quem (Super Admin), onde (Escola X) e o que foi alterado.

### Componentes de Estrutura
* **Overview Cards:** Visualização rápida de métricas de alto nível (Total Schools, Users, etc).
* **School Management:** Lista de cards com acesso profundo à configuração da conta da instituição.
* **Partner Network:** Visão unificada da rede de benefícios por estado/cidade.
* **Master Auditor:** Tabela de logs filtrável por escola e tipo de ação.
