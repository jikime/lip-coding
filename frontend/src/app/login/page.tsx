'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: 'mentor@test.com',
    password: 'password123',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = await authAPI.login(formData);
      await login(token);
      router.push('/profile');
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const quickLogin = (role: 'mentor' | 'mentee') => {
    const testAccounts = {
      mentor: { email: 'mentor@test.com', password: 'password123' },
      mentee: { email: 'mentee@test.com', password: 'password123' }
    };
    setFormData(testAccounts[role]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-gray-900">
            로그인
          </CardTitle>
          <CardDescription>
            또는{' '}
            <Link
              href="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              새 계정 만들기
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 빠른 로그인 버튼들 */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">빠른 테스트 로그인:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => quickLogin('mentor')}
                className="text-sm"
              >
                멘토로 로그인
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => quickLogin('mentee')}
                className="text-sm"
              >
                멘티로 로그인
              </Button>
            </div>
          </div>
          
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는 직접 입력</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  data-testid="email-input"
                  className="mt-1"
                />
              </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                data-testid="password-input"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              id="login"
              data-testid="login-button"
              className="w-full"
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </div>
        </form>
        </CardContent>
      </Card>
    </div>
  );
}