import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage } from '@/types/chat';

export class WebSocketClient {
    private client: Client | null = null;
    private subscriptions: Map<number, StompSubscription> = new Map();
    private messageHandlers: Map<number, (message: ChatMessage) => void> = new Map();
    private connectionPromise: Promise<void> | null = null;

    constructor(private baseUrl: string) {}

    /**
     * WebSocket 연결
     */
    connect(): Promise<void> {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                /**
                 * 🔥 여기서 HTTPS 환경에 맞춰 URL 보정
                 */
                let wsBaseUrl = this.baseUrl;

                // baseUrl 미입력 시 → 현재 페이지 origin 자동 사용
                if (!wsBaseUrl) {
                    wsBaseUrl = window.location.origin;
                }

                // HTTP → WS, HTTPS → WSS 로 자동 변환
                if (wsBaseUrl.startsWith("https://")) {
                    wsBaseUrl = wsBaseUrl.replace("https://", "https://"); // SockJS 자동 처리
                } else if (wsBaseUrl.startsWith("http://")) {
                    wsBaseUrl = wsBaseUrl.replace("http://", "http://");
                }

                const socket = new SockJS(`${wsBaseUrl}/ws-chat`);

                this.client = new Client({
                    webSocketFactory: () => socket as any,
                    debug: (str) => console.log('[STOMP Debug]', str),
                    reconnectDelay: 5000,
                    heartbeatIncoming: 4000,
                    heartbeatOutgoing: 4000,

                    onConnect: () => {
                        console.log('✅ WebSocket Connected');
                        resolve();
                    },

                    onStompError: (frame) => {
                        console.error('❌ STOMP Error:', frame);
                        reject(new Error(frame.headers['message'] || 'STOMP connection failed'));
                    },

                    onWebSocketError: (event) => {
                        console.error('❌ WebSocket Error:', event);
                        reject(new Error('WebSocket connection failed'));
                    },

                    onDisconnect: () => {
                        console.log('🔌 WebSocket Disconnected');
                        this.connectionPromise = null;
                    },
                });

                this.client.activate();
            } catch (error) {
                console.error('❌ Failed to initialize WebSocket:', error);
                this.connectionPromise = null;
                reject(error);
            }
        });

        return this.connectionPromise;
    }

    /**
     * 채팅방 구독
     */
    async subscribe(roomId: number, onMessage: (message: ChatMessage) => void): Promise<void> {
        await this.connect();

        if (!this.client?.connected) {
            throw new Error('WebSocket is not connected');
        }

        // 이미 구독 중이면 해제
        if (this.subscriptions.has(roomId)) {
            this.unsubscribe(roomId);
        }

        const subscription = this.client.subscribe(`/topic/chatroom.${roomId}`, (message: IMessage) => {
            try {
                const chatMessage: ChatMessage = JSON.parse(message.body);
                console.log('📨 Received message:', chatMessage);
                onMessage(chatMessage);
            } catch (error) {
                console.error('❌ Failed to parse message:', error);
            }
        });

        this.subscriptions.set(roomId, subscription);
        this.messageHandlers.set(roomId, onMessage);
        console.log(`✅ Subscribed to room ${roomId}`);
    }

    unsubscribe(roomId: number): void {
        const subscription = this.subscriptions.get(roomId);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(roomId);
            this.messageHandlers.delete(roomId);
            console.log(`✅ Unsubscribed from room ${roomId}`);
        }
    }

    unsubscribeAll(): void {
        this.subscriptions.forEach((subscription, roomId) => {
            subscription.unsubscribe();
            console.log(`✅ Unsubscribed from room ${roomId}`);
        });
        this.subscriptions.clear();
        this.messageHandlers.clear();
    }

    disconnect(): void {
        this.unsubscribeAll();
        if (this.client) {
            this.client.deactivate();
            this.client = null;
            this.connectionPromise = null;
            console.log('🔌 WebSocket Disconnected');
        }
    }

    isConnected(): boolean {
        return this.client?.connected ?? false;
    }
}

// 싱글톤 인스턴스
let wsClient: WebSocketClient | null = null;

/**
 * WebSocket 클라이언트 인스턴스 가져오기
 */
export const getWebSocketClient = (baseUrl: string = ''): WebSocketClient => {
    if (!wsClient) {
        // baseUrl 없이 호출되면 window.origin 자동 사용
        wsClient = new WebSocketClient(baseUrl || '');
    }
    return wsClient;
};

export const cleanupWebSocket = (): void => {
    if (wsClient) {
        wsClient.disconnect();
        wsClient = null;
    }
};
