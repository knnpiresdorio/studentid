-- 1. Criar o tipo de status se ainda não existir (RF05)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        CREATE TYPE request_status AS ENUM ('pendente', 'aprovado', 'rejeitado');
    END IF;
END $$;

-- 2. Ajustar a tabela 'dependents' para refletir o PRD
ALTER TABLE dependents 
-- Renomeia parent_id para master_id para alinhar com a lógica de "Aluno Master"
RENAME COLUMN parent_id TO master_id;

ALTER TABLE dependents
-- Adiciona colunas para Moderação (RF05) e Auditoria
ADD COLUMN IF NOT EXISTS status request_status DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
-- Adiciona revenue_share_pct em schools se faltar (RF11)
ADD COLUMN IF NOT EXISTS revenue_share_pct NUMERIC(5,2) DEFAULT 30.00; 

-- Nota: Verifica se a tabela schools tem a coluna revenue_share_pct
ALTER TABLE schools ADD COLUMN IF NOT EXISTS revenue_share_pct NUMERIC(5,2) DEFAULT 30.00;

-- 3. Criar a View Financeira Final (Métrica de Sucesso do Super Admin)
DROP VIEW IF EXISTS vw_financial_summary;

CREATE VIEW vw_financial_summary AS
SELECT 
  s.id as school_id,
  s.name as school_name,
  -- Conta apenas dependentes aprovados (monetizados após os 2 grátis - RF02)
  COUNT(d.id) FILTER (WHERE d.status = 'aprovado') as total_dependents_active,
  -- Cálculo de receita estimada para a plataforma (Split configurado - RF09/11)
  COALESCE(
    (COUNT(d.id) FILTER (WHERE d.status = 'aprovado') * 29.90) * (s.revenue_share_pct / 100), 
    0
  ) as platform_estimated_revenue
FROM schools s
LEFT JOIN profiles p ON p.school_id = s.id
LEFT JOIN dependents d ON d.master_id = p.id
GROUP BY s.id, s.name, s.revenue_share_pct;