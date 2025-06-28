'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { profileAPI } from '@/lib/api';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.profile.name || '',
    bio: user?.profile.bio || '',
    skills: user?.role === 'mentor' ? user.profile.skills?.join(', ') || '' : '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const updateData = {
        id: user.id,
        name: formData.name,
        role: user.role,
        bio: formData.bio,
        ...(profileImage && { image: profileImage }),
        ...(user.role === 'mentor' && { skills: formData.skills.split(',').map(s => s.trim()) }),
      };

      console.log('Submitting profile update:', updateData);
      const updatedUser = await profileAPI.updateProfile(updateData);
      console.log('Profile update success:', updatedUser);
      setMessage('프로필이 성공적으로 업데이트되었습니다.');
    } catch (err: any) {
      console.error('Profile update failed:', err.response?.data || err.message);
      setMessage(`프로필 업데이트에 실패했습니다: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setMessage('이미지 크기는 1MB 이하여야 합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result.split(',')[1]); // Remove data:image/...;base64, prefix
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const defaultImageUrl = user.role === 'mentor' 
    ? 'https://placehold.co/500x500.jpg?text=MENTOR'
    : 'https://placehold.co/500x500.jpg?text=MENTEE';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">프로필 설정</h1>            <p className="mt-1 text-sm text-gray-500">
              나의 프로필 정보를 관리합니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {message && (
              <div className={`px-4 py-3 rounded ${
                message.includes('성공') 
                  ? 'bg-green-50 border border-green-200 text-green-600'
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                {message}
              </div>
            )}

            <div className="flex items-center space-x-6">
              <div className="shrink-0">
                <img
                  id="profile-photo"
                  className="h-24 w-24 object-cover rounded-full"
                  src={user.profile.imageUrl || defaultImageUrl}
                  alt="프로필 이미지"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  프로필 이미지
                </label>
                <div className="mt-1">
                  <input
                    ref={fileInputRef}
                    id="profile"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleImageChange}                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  JPG, PNG 파일만 가능. 최대 1MB.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                자기소개
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="자신에 대해 간단히 소개해주세요"
              />
            </div>            {user.role === 'mentor' && (
              <div>
                <label htmlFor="skillsets" className="block text-sm font-medium text-gray-700">
                  기술 스택
                </label>
                <input
                  type="text"
                  id="skillsets"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="React, Vue, JavaScript (쉼표로 구분)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  쉼표(,)로 구분하여 입력해주세요
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                id="save"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}