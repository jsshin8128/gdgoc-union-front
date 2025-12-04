import apiClient from '../api';
import {
    CreateChatRoomRequest,
    CreateChatRoomResponse,
    ChatRoomListResponse,
    SendMessageRequest,
    ChatMessage,
    MessagePageResponse,
    UpdateReadStatusRequest,
    UpdateReadStatusResponse,
} from '@/types/chat';

/**
 * 채팅방 생성
 * POST /api/chatrooms
 */
export const createChatRoom = async (request: CreateChatRoomRequest): Promise<CreateChatRoomResponse> => {
    const response = await apiClient.post<{ success: boolean; data: CreateChatRoomResponse }>('/api/chatrooms', request);
    return response.data.data;
};

/**
 * 채팅방 목록 조회
 * GET /api/chatrooms
 */
export const getChatRoomList = async (): Promise<ChatRoomListResponse> => {
    const response = await apiClient.get<{ success: boolean; data: ChatRoomListResponse }>('/api/chatrooms');
    return response.data.data;
};

/**
 * 메시지 전송
 * POST /api/chatrooms/{roomId}/messages
 */
export const sendMessage = async (roomId: number, request: SendMessageRequest): Promise<ChatMessage> => {
    const response = await apiClient.post<{ success: boolean; data: ChatMessage }>(
        `/api/chatrooms/${roomId}/messages`,
        request
    );
    return response.data.data;
};

/**
 * 메시지 목록 조회 (페이징)
 * GET /api/chatrooms/{roomId}/messages
 */
export const getMessages = async (
    roomId: number,
    cursor?: number | null,
    size: number = 30
): Promise<MessagePageResponse> => {
    const params = new URLSearchParams();
    if (cursor !== null && cursor !== undefined) {
        params.append('cursor', cursor.toString());
    }
    params.append('size', size.toString());

    const response = await apiClient.get<{ success: boolean; data: MessagePageResponse }>(
        `/api/chatrooms/${roomId}/messages?${params.toString()}`
    );
    return response.data.data;
};

/**
 * 메시지 읽음 처리
 * PATCH /api/chatrooms/{roomId}/read
 */
export const updateReadStatus = async (
    roomId: number,
    request: UpdateReadStatusRequest
): Promise<UpdateReadStatusResponse> => {
    const response = await apiClient.put<{ success: boolean; data: UpdateReadStatusResponse }>(
        `/api/chatrooms/${roomId}/read-status`,  // 수정!
        request
    );
    return response.data.data;
};