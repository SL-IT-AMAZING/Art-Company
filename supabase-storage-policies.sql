CREATE POLICY "Allow authenticated uploads to artworks"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'artworks');

CREATE POLICY "Allow public read artworks"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'artworks');

CREATE POLICY "Allow authenticated update artworks"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'artworks');

CREATE POLICY "Allow authenticated delete artworks"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'artworks');

CREATE POLICY "Allow authenticated uploads to posters"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'posters');

CREATE POLICY "Allow public read posters"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'posters');

CREATE POLICY "Allow authenticated update posters"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'posters');

CREATE POLICY "Allow authenticated delete posters"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'posters');
