-- Ativar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_usage ENABLE ROW LEVEL SECURITY;

------------------------------------------------------------------
-- POLÍTICAS PARA A TABELA: PROFILES
------------------------------------------------------------------

-- 1. Utilizadores podem ver o seu próprio perfil
CREATE POLICY "Utilizadores podem ver o próprio perfil"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- 2. Admins de Escola podem ver perfis da sua própria escola
CREATE POLICY "Admins de Escola vêem alunos da sua escola"
ON profiles FOR SELECT
USING (get_my_role() = 'admin_escola' AND school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

-- 3. Super Admins vêem tudo
CREATE POLICY "Super Admins vêem tudo"
ON profiles FOR ALL
USING (get_my_role() = 'super_admin');


------------------------------------------------------------------
-- POLÍTICAS PARA A TABELA: DEPENDENTES
------------------------------------------------------------------

-- 1. Aluno Master pode ver e criar os seus próprios dependentes
CREATE POLICY "Alunos Master gerem os seus dependentes"
ON dependents FOR ALL
USING (auth.uid() = master_id);

-- 2. Admins de Escola podem ver e atualizar dependentes (para aprovação)
CREATE POLICY "Admins de Escola gerem dependentes da unidade"
ON dependents FOR SELECT
USING (get_my_role() = 'admin_escola');

CREATE POLICY "Admins de Escola aprovam dependentes"
ON dependents FOR UPDATE
USING (get_my_role() = 'admin_escola');


------------------------------------------------------------------
-- POLÍTICAS PARA A TABELA: AUDIT_LOGS (LGPD)
------------------------------------------------------------------

-- 1. Apenas Super Admins podem ler logs de auditoria
CREATE POLICY "Apenas Super Admins lêem logs"
ON audit_logs FOR SELECT
USING (get_my_role() = 'super_admin');

-- 2. Sistema pode inserir logs (qualquer admin autenticado ao realizar CRUD)
CREATE POLICY "Admins inserem logs"
ON audit_logs FOR INSERT
WITH CHECK (get_my_role() IN ('admin_escola', 'super_admin'));


------------------------------------------------------------------
-- POLÍTICAS PARA A TABELA: BENEFIT_USAGE
------------------------------------------------------------------

-- 1. Alunos vêem o seu próprio histórico de uso
CREATE POLICY "Alunos vêem o seu histórico"
ON benefit_usage FOR SELECT
USING (auth.uid() = profile_id);

-- 2. Atendentes e Admins de Loja podem inserir registos de uso
CREATE POLICY "Parceiros registam uso"
ON benefit_usage FOR INSERT
WITH CHECK (get_my_role() IN ('atendente', 'admin_loja'));