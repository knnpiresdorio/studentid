-- Remove o schema public e o recria (limpeza total de tabelas, tipos e triggers)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Garante as permissões básicas para o Supabase continuar funcionando
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;