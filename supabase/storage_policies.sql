-- Execute no SQL Editor do Supabase após criar os 3 buckets (covers, characters, groups)

-- LEITURA pública (já funciona se o bucket é public, mas garante via policy)
CREATE POLICY "Public read covers"     ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "Public read characters" ON storage.objects FOR SELECT USING (bucket_id = 'characters');
CREATE POLICY "Public read groups"     ON storage.objects FOR SELECT USING (bucket_id = 'groups');

-- UPLOAD permitido para todos (anon incluso) — adequado para app sem auth
CREATE POLICY "Allow upload covers"     ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'covers');
CREATE POLICY "Allow upload characters" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'characters');
CREATE POLICY "Allow upload groups"     ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'groups');

-- DELETE permitido para todos
CREATE POLICY "Allow delete covers"     ON storage.objects FOR DELETE USING (bucket_id = 'covers');
CREATE POLICY "Allow delete characters" ON storage.objects FOR DELETE USING (bucket_id = 'characters');
CREATE POLICY "Allow delete groups"     ON storage.objects FOR DELETE USING (bucket_id = 'groups');
