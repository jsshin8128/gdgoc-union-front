export interface SubscribeRequest {
  artiProfileId: number;
}

export interface SubscriptionResponse {
  subscriptionId: number;
  memberId: number;
  artiProfileId: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

import { getArtistName } from '../../data/artistSchedules';

const MOCK_SUBSCRIPTIONS_KEY = 'mock_subscriptions';

const getMockSubscriptions = (): number[] => {
  const subscriptionsJson = localStorage.getItem(MOCK_SUBSCRIPTIONS_KEY);
  return subscriptionsJson ? JSON.parse(subscriptionsJson) : [];
};

const saveMockSubscriptions = (subscriptions: number[]) => {
  localStorage.setItem(MOCK_SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
};

/**
 * 아티스트 구독하기 (Mock)
 */
export const subscribeToArtist = async (artiProfileId: number): Promise<SubscriptionResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        reject(new Error('로그인이 필요합니다.'));
        return;
      }

      const currentSubscriptions = getMockSubscriptions();
      if (currentSubscriptions.includes(artiProfileId)) {
        reject(new Error('이미 구독 중인 아티스트입니다.'));
        return;
      }

      const updatedSubscriptions = [...currentSubscriptions, artiProfileId];
      saveMockSubscriptions(updatedSubscriptions);

      resolve({
        subscriptionId: Date.now(),
        memberId: 1,
        artiProfileId,
        createdAt: new Date().toISOString(),
      });
    }, 300);
  });
};

/**
 * 구독 목록 가져오기 (Mock)
 */
export const getSubscriptions = async (): Promise<SubscriptionResponse[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const subscriptionIds = getMockSubscriptions();
      const subscriptions: SubscriptionResponse[] = subscriptionIds.map((id, index) => ({
        subscriptionId: index + 1,
        memberId: 1,
        artiProfileId: id,
        createdAt: new Date().toISOString(),
      }));
      resolve(subscriptions);
    }, 200);
  });
};

/**
 * 구독 취소하기 (Mock)
 */
export const unsubscribeFromArtist = async (artiProfileId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        reject(new Error('로그인이 필요합니다.'));
        return;
      }

      const currentSubscriptions = getMockSubscriptions();
      const updatedSubscriptions = currentSubscriptions.filter(id => id !== artiProfileId);
      saveMockSubscriptions(updatedSubscriptions);
      resolve();
    }, 300);
  });
};

