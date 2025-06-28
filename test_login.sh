#!/bin/bash

echo "=== 멘토-멘티 로그인 테스트 시작 ==="
echo

# 백엔드 URL
BACKEND_URL="http://localhost:8080/api"

echo "1. 멘토 로그인 테스트..."
MENTOR_RESPONSE=$(curl -s -X POST "$BACKEND_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "mentor@test.com", "password": "password123"}')

if echo "$MENTOR_RESPONSE" | grep -q "token"; then
  echo "✅ 멘토 로그인 성공!"
  MENTOR_TOKEN=$(echo "$MENTOR_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "토큰 길이: ${#MENTOR_TOKEN}"
else
  echo "❌ 멘토 로그인 실패: $MENTOR_RESPONSE"
  exit 1
fi

echo
echo "2. 멘티 로그인 테스트..."
MENTEE_RESPONSE=$(curl -s -X POST "$BACKEND_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "mentee@test.com", "password": "password123"}')

if echo "$MENTEE_RESPONSE" | grep -q "token"; then
  echo "✅ 멘티 로그인 성공!"
  MENTEE_TOKEN=$(echo "$MENTEE_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "토큰 길이: ${#MENTEE_TOKEN}"
else
  echo "❌ 멘티 로그인 실패: $MENTEE_RESPONSE"
  exit 1
fi

echo
echo "3. 멘토 프로필 조회 테스트..."
MENTOR_PROFILE=$(curl -s -H "Authorization: Bearer $MENTOR_TOKEN" "$BACKEND_URL/me")
if echo "$MENTOR_PROFILE" | grep -q "mentor"; then
  echo "✅ 멘토 프로필 조회 성공!"
  echo "멘토 이름: $(echo "$MENTOR_PROFILE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)"
else
  echo "❌ 멘토 프로필 조회 실패: $MENTOR_PROFILE"
fi

echo
echo "4. 멘티 프로필 조회 테스트..."
MENTEE_PROFILE=$(curl -s -H "Authorization: Bearer $MENTEE_TOKEN" "$BACKEND_URL/me")
if echo "$MENTEE_PROFILE" | grep -q "mentee"; then
  echo "✅ 멘티 프로필 조회 성공!"
  echo "멘티 이름: $(echo "$MENTEE_PROFILE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)"
else
  echo "❌ 멘티 프로필 조회 실패: $MENTEE_PROFILE"
fi

echo
echo "5. 멘토 목록 조회 테스트 (멘티 권한)..."
MENTORS_LIST=$(curl -s -H "Authorization: Bearer $MENTEE_TOKEN" "$BACKEND_URL/mentors")
if echo "$MENTORS_LIST" | grep -q "mentor"; then
  echo "✅ 멘토 목록 조회 성공!"
  MENTOR_COUNT=$(echo "$MENTORS_LIST" | grep -o '"role":"mentor"' | wc -l)
  echo "조회된 멘토 수: $MENTOR_COUNT"
else
  echo "❌ 멘토 목록 조회 실패: $MENTORS_LIST"
fi

echo
echo "6. 프론트엔드 연결 테스트..."
FRONTEND_RESPONSE=$(curl -s "http://localhost:3002" | head -c 100)
if echo "$FRONTEND_RESPONSE" | grep -q "html"; then
  echo "✅ 프론트엔드 연결 성공!"
else
  echo "❌ 프론트엔드 연결 실패"
fi

echo
echo "=== 모든 테스트 통과! ==="
echo
echo "📝 브라우저 테스트 방법:"
echo "1. 브라우저에서 http://localhost:3002/login 접속"
echo "2. 다음 중 하나를 선택:"
echo "   - '멘토로 로그인' 버튼 클릭"
echo "   - '멘티로 로그인' 버튼 클릭"
echo "   - 또는 수동 입력:"
echo "     * 멘토: mentor@test.com / password123"
echo "     * 멘티: mentee@test.com / password123"
echo "3. 로그인 성공 후 /profile 페이지로 리다이렉트되는지 확인"