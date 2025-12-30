-- =====================================================
-- Contact 문의 테이블
-- =====================================================

CREATE TABLE contact_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(500),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_contact_unread ON contact_inquiries(is_read, created_at DESC);
CREATE INDEX idx_contact_email ON contact_inquiries(email);

-- RLS 활성화
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 누구나 문의를 생성할 수 있음 (비로그인 사용자 포함)
CREATE POLICY "Anyone can create contact inquiries" ON contact_inquiries
  FOR INSERT WITH CHECK (true);

-- 관리자만 문의 조회 가능
CREATE POLICY "Admins can view contact inquiries" ON contact_inquiries
  FOR SELECT USING (is_admin(auth.uid()));

-- 관리자만 문의 업데이트 가능 (읽음 처리)
CREATE POLICY "Admins can update contact inquiries" ON contact_inquiries
  FOR UPDATE USING (is_admin(auth.uid()));

-- 관리자만 문의 삭제 가능
CREATE POLICY "Admins can delete contact inquiries" ON contact_inquiries
  FOR DELETE USING (is_admin(auth.uid()));

COMMENT ON TABLE contact_inquiries IS 'Contact 폼으로 들어온 문의사항';
