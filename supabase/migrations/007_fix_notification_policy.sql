-- =====================================================
-- 알림 생성 권한 수정
-- =====================================================

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Authenticated users can create their own notifications" ON registration_notifications;

-- 인증된 사용자는 자신의 알림을 생성할 수 있음 (회원가입 시)
CREATE POLICY "Authenticated users can create their own notifications" ON registration_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
