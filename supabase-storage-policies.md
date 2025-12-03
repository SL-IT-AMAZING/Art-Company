# Supabase Storage RLS Policies

Supabase SQL Editor에서 아래 쿼리들을 실행하세요.

## artworks 버킷 정책

```sql
-- artworks 버킷 INSERT 정책 (인증된 사용자만 업로드)
CREATE POLICY "Allow authenticated uploads to artworks"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'artworks');

-- artworks 버킷 SELECT 정책 (공개 읽기)
CREATE POLICY "Allow public read artworks"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'artworks');

-- artworks 버킷 UPDATE 정책
CREATE POLICY "Allow authenticated update artworks"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'artworks');

-- artworks 버킷 DELETE 정책
CREATE POLICY "Allow authenticated delete artworks"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'artworks');
```

## posters 버킷 정책

```sql
-- posters 버킷 INSERT 정책
CREATE POLICY "Allow authenticated uploads to posters"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posters');

-- posters 버킷 SELECT 정책 (공개 읽기)
CREATE POLICY "Allow public read posters"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'posters');

-- posters 버킷 UPDATE 정책
CREATE POLICY "Allow authenticated update posters"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'posters');

-- posters 버킷 DELETE 정책
CREATE POLICY "Allow authenticated delete posters"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'posters');
```

## 한번에 모두 실행

```sql
-- ========== ARTWORKS 버킷 ==========
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

-- ========== POSTERS 버킷 ==========
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
```

## 기존 정책 삭제 (필요한 경우)

```sql
-- 기존 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'objects';

-- 특정 정책 삭제 예시
DROP POLICY IF EXISTS "정책이름" ON storage.objects;
```
