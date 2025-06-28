/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider } from '../src/hooks/useAuth';

// 프론트엔드 컴포넌트를 테스트하기 위한 유틸리티 함수
export const renderWithAuth = (ui, { initialUser = null, ...options } = {}) => {
  return render(
    <AuthProvider initialUser={initialUser}>{ui}</AuthProvider>,
    options
  );
};

// 예시 테스트: 로그인 페이지에 이메일과 비밀번호 입력 필드가 있는지 확인
test('login page renders email and password inputs', () => {
  // 실제 로그인 컴포넌트를 import하고 테스트해야 합니다
  // 현재는 예시로만 제공됩니다
  const LoginPage = () => (
    <div>
      <input type="email" placeholder="이메일" />
      <input type="password" placeholder="비밀번호" />
      <button>로그인</button>
    </div>
  );
  
  render(<LoginPage />);
  
  expect(screen.getByPlaceholderText('이메일')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('비밀번호')).toBeInTheDocument();
  expect(screen.getByText('로그인')).toBeInTheDocument();
});
