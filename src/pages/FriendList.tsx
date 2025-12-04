import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MessageCircle, User, Loader2, UserPlus } from "lucide-react";
import { getFriends, FriendResponse } from "@/lib/api/friends";
import { getOrCreateChatRoom } from "@/lib/chatstore";
import { toast } from "sonner";

const FriendList = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      const friendsList = await getFriends();
      setFriends(friendsList);
    } catch (error) {
      console.error('친구 목록 조회 실패:', error);
      toast.error('친구 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = (friend: FriendResponse) => {
    // 상대방 ID 결정 (내가 보낸 요청이면 receiverId, 받은 요청이면 senderId)
    const friendId = friend.isSentByMe ? friend.receiverId : friend.senderId;
    const friendName = `User #${friendId}`;
    
    // 채팅방 생성 또는 가져오기
    const chatRoom = getOrCreateChatRoom(friendName, "친구");
    navigate(`/chat/${chatRoom.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-4">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6 px-1">
          <button 
            onClick={() => navigate("/my")}
            className="p-2 hover:bg-muted rounded-xl transition-all duration-200 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">친구 목록</h1>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">로딩 중...</p>
          </div>
        ) : friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-primary" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-1">아직 친구가 없어요</p>
            <p className="text-sm text-muted-foreground text-center mb-6">
              게시글이나 댓글에서 친구를 추가하거나<br />
              친구 요청 탭에서 사용자 ID로 초대해보세요
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/my/friend-requests")}
              className="rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary/40"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              친구 요청으로 이동
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((friend) => {
              const friendId = friend.isSentByMe ? friend.receiverId : friend.senderId;
              return (
                <Card 
                  key={friend.id} 
                  className="border border-border bg-card rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/20"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14 ring-2 ring-primary/10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                          <User className="w-7 h-7" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-base mb-1 truncate">
                          User #{friendId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(friend.createdAt).toLocaleDateString('ko-KR', { 
                            year: 'numeric',
                            month: 'long', 
                            day: 'numeric'
                          })}부터 친구
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartChat(friend)}
                        className="h-10 px-4 rounded-xl border-border hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-200 active:scale-95 shrink-0"
                      >
                        <MessageCircle className="w-4 h-4 mr-1.5" />
                        채팅
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default FriendList;