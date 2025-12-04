import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getChatRoomList, createChatRoom } from "@/lib/api/chat";
import { ChatRoomSummary, RoomType } from "@/types/chat";

const Chatting = () => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatRooms, setChatRooms] = useState<ChatRoomSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // 채팅방 생성 폼
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState<RoomType>(RoomType.GROUP);
  const [memberIds, setMemberIds] = useState("");

  // 채팅방 목록 로드
  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const response = await getChatRoomList();
      setChatRooms(response.rooms);
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
      toast.error('채팅방 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChatRooms();
  }, []);

  // 채팅방 생성
  const handleCreateChatRoom = async () => {
    if (roomType === RoomType.GROUP && !roomName.trim()) {
      toast.error('그룹 채팅방 이름을 입력하세요.');
      return;
    }

    if (!memberIds.trim()) {
      toast.error('초대할 사용자 ID를 입력하세요.');
      return;
    }

    try {
      const memberIdList = memberIds
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));

      if (memberIdList.length === 0) {
        toast.error('유효한 사용자 ID를 입력하세요.');
        return;
      }

      await createChatRoom({
        roomType,
        name: roomType === RoomType.GROUP ? roomName : null,
        memberIds: memberIdList,
      });

      toast.success('채팅방이 생성되었습니다.');
      setCreateOpen(false);
      setRoomName("");
      setMemberIds("");
      loadChatRooms();
    } catch (error) {
      console.error('Failed to create chat room:', error);
      toast.error('채팅방 생성에 실패했습니다.');
    }
  };

  // 시간 포맷팅
  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;

    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // 검색 필터링
  const searchResults = chatRooms.filter(room => {
    const searchLower = searchQuery.toLowerCase();
    return (
      room.name?.toLowerCase().includes(searchLower) ||
      room.lastMessage?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-background border-b border-border z-40">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">채팅</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCreateOpen(true)}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <Search className="w-6 h-6" />
            </button>
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Chat List */}
      <div className="max-w-screen-xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : chatRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <p className="text-muted-foreground mb-4">아직 채팅방이 없습니다</p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              새 채팅 시작하기
            </Button>
          </div>
        ) : (
          searchResults.map((room) => (
            <div
              key={room.roomId}
              onClick={() => navigate(`/chat/${room.roomId}`)}
              className="flex items-center gap-4 p-4 hover:bg-accent cursor-pointer transition-colors border-b border-border"
            >
              <Avatar className="w-12 h-12" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold truncate">
                    {room.name || `채팅방 ${room.roomId}`}
                  </h3>
                  <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                    {formatTime(room.updatedAt)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {room.lastMessage || '메시지가 없습니다'}
                </p>
              </div>
              {room.unreadCount > 0 && (
                <div className="bg-primary text-primary-foreground text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {room.unreadCount}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>채팅 검색</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="채팅방 또는 메시지 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.map((room) => (
              <div
                key={room.roomId}
                onClick={() => {
                  navigate(`/chatting/${room.roomId}`);
                  setSearchOpen(false);
                }}
                className="p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors"
              >
                <h4 className="font-medium">{room.name || `채팅방 ${room.roomId}`}</h4>
                <p className="text-sm text-muted-foreground truncate">
                  {room.lastMessage || '메시지가 없습니다'}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Chat Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 채팅방 만들기</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="chatType">채팅 타입</Label>
              <Select
                value={roomType}
                onValueChange={(value) => setRoomType(value as RoomType)}
              >
                <SelectTrigger id="chatType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RoomType.DIRECT}>1:1 채팅</SelectItem>
                  <SelectItem value={RoomType.GROUP}>그룹 채팅</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {roomType === RoomType.GROUP && (
              <div>
                <Label htmlFor="roomName">채팅방 이름</Label>
                <Input
                  id="roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="채팅방 이름을 입력하세요"
                />
              </div>
            )}

            <div>
              <Label htmlFor="memberIds">초대할 사용자 ID</Label>
              <Input
                id="memberIds"
                value={memberIds}
                onChange={(e) => setMemberIds(e.target.value)}
                placeholder="예: 2, 3, 4 (쉼표로 구분)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                초대할 사용자의 ID를 쉼표로 구분하여 입력하세요
              </p>
            </div>

            <Button onClick={handleCreateChatRoom} className="w-full">
              채팅방 만들기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chatting;