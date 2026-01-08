-- 1. CORRIGIR O USUÁRIO (Vincular Escola e Papel)
-- Substitua o email se necessário, mas usei o dos logs.
UPDATE public.profiles
SET 
  role = 'SCHOOL_ADMIN',
  school_id = 'f9420778-5535-42c6-8065-c5ec6a729815', -- ID da KNN Pires do Rio recuperado dos logs
  full_name = 'Admin KNN Pires do Rio'
WHERE email = 'knniresdorio@gmail.com' OR full_name LIKE 'Caio%';

-- Garantir que a tabela de roles também esteja certa
UPDATE public.user_roles
SET role = 'SCHOOL_ADMIN'
WHERE id IN (SELECT id FROM public.profiles WHERE role = 'SCHOOL_ADMIN');


-- 2. INVESTIGAR E REMOVER O GATILHO (TRIGGER)
-- Este comando vai listar os gatilhos para você ver qual apagar.
SELECT event_object_table as table_name, trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'users' OR event_object_table = 'profiles';

-- SE O GATILHO SE CHAMAR 'on_auth_user_created' (O padrão do Supabase),
-- VOCÊ PODE APAGÁ-LO RODANDO O COMANDO ABAIXO:
-- (Remova os traços -- do início da linha abaixo para rodar)

-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();

-- IMPORTANTE:
-- Ao apagar esse gatilho, novos usuários não serão criados automaticamente em 'public.profiles'.
-- ISSO É BOM! Porque agora minha Edge Function ('invite-school-admin') é quem vai criar o perfil CORRETO.
