-- =====================================================
-- Art Company 관리자 시스템 마이그레이션
-- =====================================================

-- =====================================================
-- 1. 관리자 역할 시스템
-- =====================================================

-- 관리자 권한 체크 함수
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT (raw_user_meta_data->>'role')::text = 'admin'
    FROM auth.users
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 인증된 사용자에게 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;

-- =====================================================
-- 2. 공지사항 테이블
-- =====================================================

CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ko VARCHAR(500) NOT NULL,
  title_en VARCHAR(500) NOT NULL,
  content_ko TEXT NOT NULL,
  content_en TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_notices_published ON notices(is_published, published_at DESC);
CREATE INDEX idx_notices_author ON notices(author_id);

-- RLS 활성화
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- 공개된 공지사항은 모두가 볼 수 있음
CREATE POLICY "Anyone can view published notices" ON notices
  FOR SELECT USING (is_published = true);

-- 관리자만 공지사항 관리 가능
CREATE POLICY "Admins can manage notices" ON notices
  FOR ALL USING (
    is_admin(auth.uid())
  );

-- =====================================================
-- 3. 가입 알림 테이블
-- =====================================================

CREATE TABLE registration_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  user_metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_reg_notifications_unread ON registration_notifications(is_read, created_at DESC);
CREATE INDEX idx_reg_notifications_user ON registration_notifications(user_id);

-- RLS 활성화
ALTER TABLE registration_notifications ENABLE ROW LEVEL SECURITY;

-- 관리자만 알림 조회 가능
CREATE POLICY "Admins can view registration notifications" ON registration_notifications
  FOR SELECT USING (is_admin(auth.uid()));

-- 관리자만 알림 업데이트 가능
CREATE POLICY "Admins can update notifications" ON registration_notifications
  FOR UPDATE USING (is_admin(auth.uid()));

-- 인증된 사용자는 자신의 알림을 생성할 수 있음 (회원가입 시)
CREATE POLICY "Authenticated users can create their own notifications" ON registration_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 4. 자동 업데이트 트리거 (updated_at)
-- =====================================================

-- updated_at 자동 갱신 함수 (이미 존재하지 않을 경우에만 생성)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- notices 테이블에 트리거 적용
CREATE TRIGGER update_notices_updated_at
  BEFORE UPDATE ON notices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- 5. 초기 관리자 계정 설정 안내
-- =====================================================

-- 주의: 아래 SQL은 Supabase Dashboard의 SQL Editor에서 수동으로 실행하세요
-- 관리자 이메일 주소를 실제 값으로 변경하세요

-- 예시:
-- UPDATE auth.users
-- SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
-- WHERE email = 'admin@artcompany.com';

COMMENT ON FUNCTION is_admin IS '사용자가 관리자 권한을 가지고 있는지 확인';
COMMENT ON TABLE notices IS '관리자가 작성하는 공지사항 (한/영 지원)';
COMMENT ON TABLE registration_notifications IS '신규 회원 가입 알림';
