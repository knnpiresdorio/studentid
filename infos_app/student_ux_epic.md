# Epic: Experiência do Aluno (Student Role) - UniPass Digital

Este documento detalha as hipóteses de UX, experimentos e métricas de sucesso para a jornada do aluno dentro da plataforma UniPass.

## 1. If/Then Hypothesis
**Hipótese Central:**
* **Se nós** fornecermos uma carteirinha digital offline-first integrada a um clube de benefícios dinâmico e gestão familiar simplificada,
* **Para** alunos de instituições de ensino parceiras e seus dependentes,
* **Então nós vamos** aumentar o engajamento diário com o app, reduzir custos operacionais das escolas com emissão de plásticos e gerar valor imediato através de economia real no Clube de Vantagens.

## 2. Tiny Acts of Discovery Experiments
Para testar nossas suposições, realizaremos os seguintes experimentos:

* **Experimento 1 (Validação de Uso):** Monitorar a funcionalidade de "Favoritos" no Clube de Benefícios. Se < 20% dos alunos logados favoritarem ao menos um parceiro na primeira semana, simplificaremos a descoberta de parceiros.
* **Experimento 2 (Adoção Familiar):** Testar a visibilidade do banner "Combo Família" vs. Interrupção direta. Se o banner de upsell (snoozed) tiver um CTR < 5%, testaremos uma abordagem de "Trial" de 7 dias para slots extras.
* **Experimento 3 (Capacidade Offline):** Simular falha de conexão na exibição da ID. Observar através de qualitativo se o aluno se sente confiante em apresentar a carteirinha sem internet (indicador visual de "Modo Offline" visível).

## 3. Validation Measures
Saberemos que nossa hipótese é válida se, dentro de **30 dias**, observarmos:

* **Quantitative outcome:**
    * **Engajamento:** > 60% dos alunos ativos acessam o app pelo menos 2x por semana (utilizando benefícios).
    * **Conversão:** > 15% de pedidos de upgrade para o "Combo Família" (slots 3 a 5).
    * **Operacional:** Redução de 80% nos chamados manuais para correção de dados (via uso do fluxo de `ChangeRequest`).

* **Qualitative outcome:**
    * Feedback positivo sobre a velocidade de carregamento da ID em pontos de venda (comentários em App Store/Pesquisa In-app).
    * Alunos relatando que "economizaram mais do que a mensalidade" usando o Clube.

* **Business outcome:**
    * Redução de churn de instituições parceiras em 10% devido ao valor agregado percebido pelos alunos.

## 4. Success Criteria

* **Minimum success threshold (Mínimo):**
    * 40% de retenção (W1) dos alunos.
    * 95% de sucesso em validações de ID (API Uptime + Offline Reliable).

* **Target success metrics (Meta):**
    * 70% de preenchimento dos slots de dependentes gratuitos.
    * Média de 3 usos de benefícios por aluno/mês.

* **Stretch goals (Desejável):**
    * Viralidade: Cada aluno indica a plataforma para pelo menos 1 parceiro comercial local ("Sugerir Parceiro").

---

## 5. Mapeamento de Comunicação (Technical Context)

### Pontos de Entrada e Saída de Dados
* **Visualização:** `StudentView.tsx` -> Interface centralizada de consumo.
* **Estado:** `StoreContext.tsx` -> Orquestra dados de `students`, `partners` e `change_requests`.
* **Persistência:** Supabase (Tabelas: `students`, `partners`, `change_requests`, `audit_logs`).
* **Offline-link:** `localStorage` gerencia `unipass_favorites` e `unipass_family_snooze`.

### Fluxos Críticos
1. **Identificação:** `StudentCard.tsx` + QR Code (verificação estática/dinâmica).
2. **Solicitação de Mudança:** `onRequestChange` dispara payloads para a mesa de aprovação do `SCHOOL_ADMIN`.
3. **Upsell Familiar:** Lógica de slots (1-2 grátis, 3-5 pagos) controlada via `dependents.length` e `hasFamilyCombo`.
