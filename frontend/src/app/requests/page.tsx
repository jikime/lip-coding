'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { matchRequestAPI } from '@/lib/api';
import { MatchRequest } from '@/types';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user, activeTab]);

  const fetchRequests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let data: MatchRequest[];
      
      if (activeTab === 'received' && user.role === 'mentor') {
        data = await matchRequestAPI.getReceivedRequests(user.id);
      } else if (activeTab === 'sent' && user.role === 'mentee') {
        data = await matchRequestAPI.getSentRequests(user.id);
      } else {
        data = [];
      }
      
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setMessage('요청을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: number, status: 'accepted' | 'rejected') => {
    try {
      await matchRequestAPI.updateRequestStatus(requestId, status);
      setMessage(`요청이 ${status === 'accepted' ? '수락' : '거절'}되었습니다.`);
      fetchRequests(); // 목록 새로고침
    } catch (err) {
      setMessage('요청 처리에 실패했습니다.');
    }
  };  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">로그인이 필요합니다.</p>
          </div>
        </div>
      </div>
    );
  }

  const showReceivedTab = user.role === 'mentor';
  const showSentTab = user.role === 'mentee';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">매칭 요청 관리</h1>
          <p className="mt-2 text-gray-600">
            {user.role === 'mentor' ? '받은 매칭 요청을 관리하세요' : '보낸 매칭 요청 상태를 확인하세요'}
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {showReceivedTab && (
                <button
                  onClick={() => setActiveTab('received')}
                  data-testid="received-requests-tab"
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'received'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  받은 요청
                </button>
              )}
              {showSentTab && (
                <button
                  onClick={() => setActiveTab('sent')}
                  data-testid="sent-requests-tab"
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'sent'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  보낸 요청
                </button>
              )}
            </nav>
          </div>
        </div>        {/* 메시지 표시 */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('성공') || message.includes('수락') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* 요청 목록 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">요청을 불러오고 있습니다...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">
                  {activeTab === 'received' ? '받은 요청이 없습니다.' : '보낸 요청이 없습니다.'}
                </p>
              </div>
            ) : (
              requests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  userRole={user.role}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}interface RequestCardProps {
  request: MatchRequest;
  userRole: 'mentor' | 'mentee';
  onUpdateStatus: (requestId: number, status: 'accepted' | 'rejected') => void;
}

function RequestCard({ request, userRole, onUpdateStatus }: RequestCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기중';
      case 'accepted':
        return '수락됨';
      case 'rejected':
        return '거절됨';
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg" data-testid={`request-${request.id}`}>
              {userRole === 'mentor' 
                ? `${request.mentee?.user?.name || '멘티'}님의 요청`
                : `${request.mentor?.user?.name || '멘토'}님에게 보낸 요청`
              }
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              요청일: {formatDate(request.created_at)}
            </p>
          </div>
          <span 
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}
            id="request-status"
            data-testid={`request-status-${request.id}`}
          >
            {getStatusText(request.status)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">요청 메시지</p>
          <div 
            className="request-message text-gray-800 bg-gray-50 p-3 rounded-md" 
            data-testid={`request-message-${request.id}`}
            mentee={request.mentee?.id.toString()}
          >
            {request.message}
          </div>
        </div>

      {userRole === 'mentor' && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">멘티 정보</p>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="font-medium">{request.mentee?.user?.name}</p>
            <p className="text-sm text-gray-600">{request.mentee?.user?.email}</p>
            {request.mentee?.interests && (
              <p className="text-sm text-gray-600 mt-1">
                관심 분야: {request.mentee.interests}
              </p>
            )}
          </div>
        </div>
      )}

      {userRole === 'mentee' && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">멘토 정보</p>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="font-medium">{request.mentor?.user?.name}</p>
            <p className="text-sm text-gray-600">{request.mentor?.user?.email}</p>
            {request.mentor?.skills && (
              <p className="text-sm text-gray-600 mt-1">
                기술 스택: {request.mentor.skills}
              </p>
            )}
            <p className="text-sm text-gray-600">
              경력: {request.mentor?.experience_years}년
            </p>
          </div>
        </div>
      )}

        {/* 멘토만 요청을 수락/거절할 수 있음 */}
        {userRole === 'mentor' && request.status === 'pending' && (
          <div className="flex space-x-3">
            <Button
              variant="destructive"
              onClick={() => onUpdateStatus(request.id, 'rejected')}
              id="reject"
              data-testid={`reject-request-${request.id}`}
              className="flex-1"
            >
              거절
            </Button>
            <Button
              onClick={() => onUpdateStatus(request.id, 'accepted')}
              id="accept"
              data-testid={`accept-request-${request.id}`}
              className="flex-1"
            >
              수락
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}