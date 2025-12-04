import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getMessages, sendMessage as sendMessageApi, updateReadStatus } from "@/lib/api/chat";
import { ChatMessage, MessageType } from "@/types/chat";
import { getWebSocketClient } from "@/lib/websocket";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: string;
  role: string;
  tokenType: string;
}

const ChatRoom = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsClient = useRef(getWebSocketClient());

  const getCurrentUserId = (): number => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('로그인이 필요합니다.');
      navigate('/login');
      return 0;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return parseInt(decoded.sub);
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      toast.error('인증 오류가 발생했습니다.');
      navigate('/login');
      return 0;
    }
  };

  const currentUserId = getCurrentUserId();

  // 메시지 목록 로드 및 읽음 처리
  const loadMessages = async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      const response = await getMessages(parseInt(roomId));
      setMessages(response.messages);

      // 읽음 처리: 메시지가 있으면 마지막 메시지를 읽음으로 표시
      if (response.messages.length > 0) {
        const lastMessage = response.messages[response.messages.length - 1];
        console.log('📖 Marking as read up to message:', lastMessage.messageId);

        try {
          await updateReadStatus(parseInt(roomId), {
            lastReadMessageId: lastMessage.messageId
          });
          console.log('✅ Read status updated successfully');
        } catch (error) {
          console.error('❌ Failed to update read status:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('메시지를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // WebSocket 구독
  useEffect(() => {
    if (!roomId) return;

    loadMessages();

    const client = wsClient.current;

    client.connect().then(() => {
      client.subscribe(roomId, (newMessage: ChatMessage) => {
        console.log('📨 Received message:', newMessage);
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();

        // 새 메시지 수신 시 자동 읽음 처리
        console.log('📖 Auto-marking new message as read:', newMessage.messageId);
        updateReadStatus(parseInt(roomId), { lastReadMessageId: newMessage.messageId })
          .then(() => console.log('✅ New message marked as read'))
          .catch(err => console.error('❌ Failed to mark new message as read:', err));
      });
    });

    return () => {
      client.unsubscribe(roomId);
    };
  }, [roomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !roomId || sending) return;

    try {
      setSending(true);
      await sendMessageApi(parseInt(roomId), {
        messageType: MessageType.TEXT,
        content: message.trim(),
        fileUrl: null,
      });

      setMessage("");
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('메시지 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!currentUserId) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 bg-background border-b border-border z-10">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="w-10 h-10" />
            <div>
              <h1 className="font-semibold">채팅방 {roomId}</h1>
              <p className="text-sm text-muted-foreground">온라인</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">메시지가 없습니다.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;

            return (
              <div
                key={msg.messageId}
                className={`flex gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isMine && <Avatar className="w-8 h-8 flex-shrink-0" />}

                <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  <div
                    className={`rounded-2xl px-4 py-2 ${isMine
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                      }`}
                  >
                    {msg.messageType === MessageType.TEXT && (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    )}
                    {msg.messageType === MessageType.IMAGE && msg.fileUrl && (
                      <img
                        src={msg.fileUrl}
                        alt="Uploaded"
                        className="max-w-full rounded"
                      />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        <div className="max-w-screen-xl mx-auto flex items-center gap-2">
          <button className="p-2 hover:bg-accent rounded-full transition-colors">
            <Plus className="w-5 h-5" />
          </button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="flex-1"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            size="icon"
            className="shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;

 