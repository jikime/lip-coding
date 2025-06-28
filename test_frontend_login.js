const axios = require('axios');

// 테스트 설정
const BACKEND_URL = 'http://localhost:8080/api';
const FRONTEND_URL = 'http://localhost:3002';

async function testLoginFlow() {
  console.log('=== 멘토-멘티 로그인 테스트 시작 ===\n');

  try {
    // 1. 백엔드 로그인 테스트
    console.log('1. 백엔드 직접 로그인 테스트...');
    
    const mentorLoginResponse = await axios.post(`${BACKEND_URL}/login`, {
      email: 'mentor@test.com',
      password: 'password123'
    });
    
    console.log('✅ 멘토 로그인 성공!');
    console.log('토큰 길이:', mentorLoginResponse.data.token.length);
    
    const menteeLoginResponse = await axios.post(`${BACKEND_URL}/login`, {
      email: 'mentee@test.com',
      password: 'password123'
    });
    
    console.log('✅ 멘티 로그인 성공!');
    console.log('토큰 길이:', menteeLoginResponse.data.token.length);

    // 2. 토큰으로 사용자 정보 가져오기 테스트
    console.log('\n2. 토큰으로 사용자 정보 가져오기...');
    
    const mentorToken = mentorLoginResponse.data.token;
    const mentorProfile = await axios.get(`${BACKEND_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${mentorToken}`
      }
    });
    
    console.log('✅ 멘토 프로필 조회 성공!');
    console.log('멘토 정보:', {
      id: mentorProfile.data.id,
      email: mentorProfile.data.email,
      role: mentorProfile.data.role,
      name: mentorProfile.data.profile.name
    });

    const menteeToken = menteeLoginResponse.data.token;
    const menteeProfile = await axios.get(`${BACKEND_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${menteeToken}`
      }
    });
    
    console.log('✅ 멘티 프로필 조회 성공!');
    console.log('멘티 정보:', {
      id: menteeProfile.data.id,
      email: menteeProfile.data.email,
      role: menteeProfile.data.role,
      name: menteeProfile.data.profile.name
    });

    // 3. 멘토 목록 조회 테스트 (멘티 권한으로)
    console.log('\n3. 멘토 목록 조회 테스트...');
    
    const mentorsResponse = await axios.get(`${BACKEND_URL}/mentors`, {
      headers: {
        'Authorization': `Bearer ${menteeToken}`
      }
    });
    
    console.log('✅ 멘토 목록 조회 성공!');
    console.log('멘토 수:', mentorsResponse.data.length);
    if (mentorsResponse.data.length > 0) {
      console.log('첫 번째 멘토:', mentorsResponse.data[0].profile.name);
    }

    // 4. 프론트엔드 연결 테스트
    console.log('\n4. 프론트엔드 연결 테스트...');
    
    const frontendResponse = await axios.get(FRONTEND_URL);
    console.log('✅ 프론트엔드 연결 성공!');
    console.log('프론트엔드 응답 길이:', frontendResponse.data.length, 'bytes');

    console.log('\n=== 모든 테스트 통과! ===');
    console.log('\n📝 다음 단계:');
    console.log('1. 브라우저에서 http://localhost:3002/login 접속');
    console.log('2. "멘토로 로그인" 또는 "멘티로 로그인" 버튼 클릭');
    console.log('3. 또는 수동으로 다음 정보 입력:');
    console.log('   - 멘토: mentor@test.com / password123');
    console.log('   - 멘티: mentee@test.com / password123');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    }
  }
}

// 테스트 실행
testLoginFlow();