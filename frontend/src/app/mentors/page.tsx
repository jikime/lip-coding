'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { mentorAPI, matchRequestAPI } from '@/lib/api';
import { Mentor } from '@/types';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function MentorsPage() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchSkill, setSearchSkill] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [message, setMessage] = useState('');

  if (!user || user.role !== 'mentee') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">멘티만 접근할 수 있는 페이지입니다.</p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchMentors();
  }, [searchSkill, orderBy]);

  const fetchMentors = async () => {
    try {
      const filters: any = {};
      if (searchSkill) filters.skill = searchSkill;
      if (orderBy) filters.order_by = orderBy;
      
      const data = await mentorAPI.getMentors(filters);
      setMentors(data);
    } catch (err) {
      console.error('Failed to fetch mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchRequest = async (mentorId: number, message: string) => {
    try {
      await matchRequestAPI.createRequest({
        mentorId,
        menteeId: user.id,
        message,
      });
      setMessage('매칭 요청이 성공적으로 전송되었습니다.');
    } catch (err: any) {
      setMessage('매칭 요청 전송에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">멘토 찾기</h1>
          <p className="mt-2 text-gray-600">나에게 맞는 멘토를 찾아보세요</p>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                기술 스택 검색
              </label>              <input
                type="text"
                id="search"
                data-testid="mentor-search-input"
                value={searchSkill}
                onChange={(e) => setSearchSkill(e.target.value)}
                placeholder="예: React, Python, JavaScript..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름순 정렬
              </label>
              <select
                id="name"
                value={orderBy === 'name' ? 'name' : ''}
                onChange={(e) => setOrderBy(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">기본</option>
                <option value="name">이름순</option>
              </select>
            </div>
            <div>
              <label htmlFor="skill" className="block text-sm font-medium text-gray-700">
                스킬셋순 정렬
              </label>
              <select
                id="skill"
                value={orderBy === 'skill' ? 'skill' : ''}
                onChange={(e) => setOrderBy(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">기본</option>
                <option value="skill">기술스택순</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                data-testid="mentor-search-button"
                onClick={fetchMentors}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                검색
              </button>
            </div>
          </div>
        </div>

        {/* 메시지 표시 */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.includes('성공') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* 멘토 목록 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">멘토를 검색하고 있습니다...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">조건에 맞는 멘토가 없습니다.</p>
              </div>
            ) : (
              mentors.map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  onMatchRequest={handleMatchRequest}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface MentorCardProps {
  mentor: Mentor;
  onMatchRequest: (mentorId: number, message: string) => void;
}

function MentorCard({ mentor, onMatchRequest }: MentorCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestMessage.trim()) {
      onMatchRequest(mentor.id, requestMessage);
      setShowModal(false);
      setRequestMessage('');
    }
  };

  return (
    <>
      <Card className="mentor hover:shadow-lg transition-shadow" data-mentor-id={mentor.id}>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-semibold text-lg">
                {mentor.user?.name?.charAt(0) || 'M'}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg" data-testid={`mentor-name-${mentor.id}`}>
                {mentor.user?.name || '이름 없음'}
              </CardTitle>
              <p className="text-gray-600 text-sm">{mentor.user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">기술 스택</p>
            <div className="flex flex-wrap gap-2">
              {mentor.skills?.split(',').map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  data-testid={`mentor-skill-${mentor.id}-${index}`}
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">경력: {mentor.experience_years}년</p>
            <p className="text-sm text-gray-600">평점: {mentor.rating ? `${mentor.rating}/5` : '평가 없음'}</p>
          </div>

          {mentor.bio && (
            <div>
              <p className="text-sm text-gray-600 mb-1">소개</p>
              <p className="text-sm text-gray-800 line-clamp-3">{mentor.bio}</p>
            </div>
          )}

          <Button
            onClick={() => setShowModal(true)}
            id="request"
            data-testid={`match-request-button-${mentor.id}`}
            className="w-full"
          >
            매칭 요청
          </Button>
        </CardContent>
      </Card>

      {/* 매칭 요청 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>매칭 요청</CardTitle>
              <p className="text-gray-600">
                {mentor.user?.name}님에게 매칭 요청을 보내시겠습니까?
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    요청 메시지
                  </label>
                  <Textarea
                    id="message"
                    data-mentor-id={mentor.id}
                    data-testid={`message-${mentor.id}`}
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="자기소개와 멘토링을 받고 싶은 이유를 작성해주세요..."
                    rows={4}
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    data-testid="confirm-match-request"
                    className="flex-1"
                  >
                    요청 보내기
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}