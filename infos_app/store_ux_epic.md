# Epic: Parceiros e Lojistas (#store) - UniPass Digital

Este documento detalha as hipóteses de UX, experimentos e métricas de sucesso para os papéis de Lojista (`STORE`) e Gestor de Loja (`STORE_ADMIN`) dentro da plataforma UniPass.

## 1. If/Then Hypothesis
**Hipótese Central:**
* **Se nós** fornecermos uma ferramenta de validação instantânea (QR/CPF) e um painel de métricas de uso em tempo real,
* **Para** estabelecimentos parceiros e seus funcionários,
* **Então nós vamos** agilizar o processo de checkout para alunos, reduzir fraudes de uso indevido de benefícios e fornecer dados valiosos para que lojistas ajustem suas ofertas conforme o perfil das escolas frequentadoras.

## 2. Tiny Acts of Discovery Experiments
Para testar nossas suposições, realizaremos os seguintes experimentos:

* **Experimento 1 (Velocidade de Checkout):** Comparar o tempo de validação via Scanner QR vs. Digitação de CPF. Se o CPF for usado em > 50% das vezes, melhoraremos a UX do scanner para condições de baixa iluminação.
* **Experimento 2 (Adoção de Promoções):** Monitorar a criação de promoções temporárias pelo `STORE_ADMIN`. Se < 10% dos parceiros criarem promoções extras além do desconto padrão, ofereceremos templates prontos (ex: "Combo Estudante", "Compre 1 leve 2").
* **Experimento 3 (Engajamento com Métricas):** Observar a frequência de acesso ao gráfico "Uso por Escola". Se o acesso for baixo, enviaremos um resumo semanal por email para o gestor com o ranking das escolas.

## 3. Validation Measures
Saberemos que nossa hipótese é válida se, dentro de **30 dias**, observarmos:

* **Quantitative outcome:**
    * **Performance:** Tempo médio de validação (abertura do app até confirmação) < 10 segundos.
    * **Conversão:** > 30% das validações resultam em uso de uma promoção específica (além do desconto base).
    * **Fidelidade:** Pelo menos 3 validações diárias em 70% dos parceiros ativos.

* **Qualitative outcome:**
    * Lojistas relatando facilidade em identificar dependentes e alunos ativos sem necessidade de conferência manual de documentos físicos.
    * Gestores utilizando o dashboard para decidir em quais dias da semana oferecer descontos maiores.

* **Business outcome:**
    * Aumento de 20% no número de novos parceiros comerciais devido à facilidade de gestão de benefícios comprovada por métricas.

## 4. Success Criteria

* **Minimum success threshold (Mínimo):**
    * Funcionalidade de Scanner estável em dispositivos Android e iOS de entrada.
    * Registro correto de logs para auditoria de todas as validações com sucesso ou erro.

* **Target success metrics (Meta):**
    * 80% de satisfação dos lojistas com o "Portal do Gestor" (pesquisa in-app).
    * Redução de 100% no uso de carteirinhas vencidas ou de alunos inativos no estabelecimento.

* **Stretch goals (Desejável):**
    * Gamificação: Medalhas para lojas que "Mais Atenderam Alunos" no mês.
    * Funcionalidade de "Sugerir Notificação": Lojista sugere uma promoção e a escola aprova o disparo de um push para os alunos.

---

## 5. Mapeamento de Comunicação (Technical Context)

### Pontos de Entrada e Saída de Dados
* **Interface:** `StoreView.tsx` — Dashboard adaptável conforme o papel (`STORE` vs `STORE_ADMIN`).
* **Validação:** `Scanner.tsx` + `validateStudent` (Lógica que cruza dados de `students` e gera logs de `VALIDATION_SUCCESS/FAILED`).
* **Gestão de Perfil:** Estado `editedPartner` gerencia edições locais com preview antes da persistência no Supabase.
* **Métricas:** Cálculos dinâmicos via `getLast7DaysData` e visualização via `SparklineArea` e `SparklineBar`.

### Diferenciação de Acesso
* **STORE (Staff):** Acesso simplificado. Foco total em **Validação** e **Histórico Recente**.
* **STORE_ADMIN (Gestor):** Acesso completo. **Métricas**, **Edição de Perfil**, **Gestão de Promoções** e **Filtros Avançados de Logs**.
