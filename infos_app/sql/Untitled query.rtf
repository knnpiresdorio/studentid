-- 1. Criar o bucket 'avatars' (se não existir)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Limpar políticas antigas (para evitar conflitos)
DROP POLICY IF EXISTS "Fotos acessíveis por todos logados" ON storage.objects;
DROP POLICY IF EXISTS "Usuário faz upload da própria foto" ON storage.objects;
DROP POLICY IF EXISTS "Usuário atualiza própria foto" ON storage.objects;
DROP POLICY IF EXISTS "Usuário deleta própria foto" ON storage.objects;

-- 3. POLÍTICA: VISUALIZAÇÃO
-- Permite que qualquer usuário autenticado veja as fotos (necessário para o scanner do lojista e admin)
CREATE POLICY "Fotos acessíveis por todos logados"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

-- 4. POLÍTICA: INSERT (Upload)
-- Permite que o usuário faça upload apenas para uma pasta com o seu próprio UID
-- O caminho deve ser: avatars/{auth.uid()}/nome-da-foto.jpg
CREATE POLICY "Usuário faz upload da própria foto"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. POLÍTICA: UPDATE
-- Permite que o usuário substitua apenas o seu próprio arquivo
CREATE POLICY "Usuário atualiza própria foto"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 6. POLÍTICA: DELETE
-- Permite que o usuário apague sua própria foto
CREATE POLICY "Usuário deleta própria foto"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);