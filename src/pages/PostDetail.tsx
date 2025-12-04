import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Search, Heart, MessageCircle, UserPlus, MessageSquare, Send, Trash2, Edit2, User, Clock, Share2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { getOrCreateChatRoom } from "@/lib/chatstore";
import {
  getPostDetail,
  createComment,
  deleteComment,
  deletePost,
  PostDetailResponse,
  CommentResponse,
  boardIdToBoardName,
} from "@/lib/api/posts";
import { sendFriendRequest } from "@/lib/api/friends";

const PostDetail = () => {
  const { boardId, postId } = useParams();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [post, setPost] = useState<PostDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPostDetail = async () => {
      if (!postId) return;

      try {
        setLoading(true);
        const data = await getPostDetail(Number(postId));
        setPost(data);
        setError(null);
      } catch (err) {
        console.error("게시글 로딩 실패:", err);
        setError("게시글을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [postId]);

  const handleAddFriend = async (memberId: number, displayName: string) => {
    try {
      await sendFriendRequest(memberId);
      toast.success(`${displayName}님에게 친구 요청을 보냈습니다.`);
    } catch (error: any) {
      toast.error(error.message || '친구 요청에 실패했습니다.');
    }
  };

  const handleStartChat = (username: string) => {
    const boardName = boardIdToBoardName[boardId || ""] || "게시판";
    getOrCreateChatRoom(username, boardName);
    navigate(`/chat/${username}?user=${username}&board=${encodeURIComponent(boardName)}`);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error("댓글 내용을 입력해주세요.");
      return;
    }

    if (!postId) return;

    setIsSubmittingComment(true);
    try {
      const newCommentData = await createComment(Number(postId), newComment.trim());
      setPost((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [...prev.comments, newCommentData],
        };
      });
      setNewComment("");
      toast.success("댓글이 작성되었습니다.");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      toast.error("댓글 작성에 실패했습니다.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      setPost((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.filter((c) => c.commentId !== commentId),
        };
      });
      toast.success("댓글이 삭제되었습니다.");
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      toast.error("댓글 삭제에 실패했습니다.");
    }
  };

  const handleDeletePost = async () => {
    if (!postId) return;

    if (!confirm("정말 게시글을 삭제하시겠습니까?")) return;

    try {
      await deletePost(Number(postId));
      toast.success("게시글이 삭제되었습니다.");
      navigate(`/board/${boardId}`);
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      toast.error("게시글 삭제에 실패했습니다.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const UserPopover = ({ memberId, displayName }: { memberId: number; displayName: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <button className="font-semibold text-sm text-foreground hover:text-primary transition-colors cursor-pointer">
          {displayName}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2 rounded-xl border-border/50 shadow-lg">
        <div className="flex flex-col gap-0.5">
          <div className="text-sm font-semibold text-foreground px-3 py-2 border-b border-border/50 mb-1">
            {displayName}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start gap-2 h-9 rounded-lg hover:bg-primary/5 hover:text-primary"
            onClick={() => handleAddFriend(memberId, displayName)}
          >
            <UserPlus className="w-4 h-4" />
            친구 추가
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start gap-2 h-9 rounded-lg hover:bg-primary/5 hover:text-primary"
            onClick={() => handleStartChat(displayName)}
          >
            <MessageSquare className="w-4 h-4" />
            채팅하기
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
          <div className="max-w-screen-xl mx-auto px-4 py-3.5 flex items-center gap-2">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1.5 hover:bg-muted/50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">{boardIdToBoardName[boardId || ""] || "게시판"}</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
          <div className="max-w-screen-xl mx-auto px-4 py-3.5 flex items-center gap-2">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1.5 hover:bg-muted/50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">{boardIdToBoardName[boardId || ""] || "게시판"}</h1>
          </div>
        </header>
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-destructive">{error || "게시글을 찾을 수 없습니다."}</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1.5 hover:bg-muted/50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">{boardIdToBoardName[boardId || ""] || "게시판"}</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate(`/board/${boardId}/post/${postId}/edit`)}
              className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
            >
              <Edit2 className="w-5 h-5 text-foreground" />
            </button>
            <button 
              onClick={handleDeletePost} 
              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5 text-destructive" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-4">
        <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
          {/* 게시글 내용 영역 */}
          <div className="p-5">
            {/* 게시판 태그 */}
            <div className="mb-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                {boardIdToBoardName[boardId || ""] || "게시판"}
              </span>
            </div>

            {/* 제목 */}
            <h1 className="text-2xl font-bold text-foreground mb-4 leading-tight">{post.title}</h1>

            {/* 작성자 정보 */}
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 text-sm">
                <UserPopover
                  memberId={post.memberId}
                  displayName={post.memberName || `사용자${post.memberId}`}
                />
                <span className="text-muted-foreground">·</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* 미디어 표시 */}
            {post.media && post.media.length > 0 && (
              <div className="mb-4 space-y-2">
                {post.media.map((media) => (
                  <img
                    key={media.mediaId}
                    src={media.s3Url}
                    alt="첨부 이미지"
                    className="max-w-full rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* 본문 */}
            <div className="text-foreground whitespace-pre-wrap mb-6 leading-relaxed">{post.content}</div>

            {/* 액션 버튼들 */}
            <div className="flex items-center gap-4 pt-4 border-t border-border/50">
              <button
                onClick={() => setLiked(!liked)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5"
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-primary text-primary" : ""}`} />
                <span>좋아요</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comments.length}개 댓글</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5">
                <Share2 className="w-4 h-4" />
                <span>공유</span>
              </button>
            </div>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-foreground">
              댓글 {post.comments.length > 0 && <span className="text-primary">({post.comments.length})</span>}
            </h2>
          </div>

          {/* 댓글 입력  */}
          <div className="bg-card rounded-xl border border-border/50 p-4 shadow-sm">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="댓글을 입력하세요..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSubmitComment()}
                  disabled={isSubmittingComment}
                  className="h-10 text-sm border-border/50 bg-muted/30 focus:bg-background rounded-lg"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmittingComment || !newComment.trim()}
                  size="sm"
                  className="h-10 px-4 rounded-lg bg-primary hover:bg-primary/90 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 댓글 목록  */}
          {post.comments.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border/50">
              <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {post.comments.map((comment) => (
                <div key={comment.commentId} className="bg-card rounded-xl border border-border/50 p-4 shadow-sm hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                            <User className="w-3.5 h-3.5" />
                          </AvatarFallback>
                        </Avatar>
                        <UserPopover
                          memberId={comment.memberId}
                          displayName={comment.memberName || `사용자${comment.memberId}`}
                        />
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{formatCommentDate(comment.createdAt)}</span>
                        <button
                          onClick={() => handleDeleteComment(comment.commentId)}
                          className="ml-auto text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-sm text-foreground mb-3 leading-relaxed">{comment.content}</div>
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded hover:bg-primary/5">
                          <Heart className="w-3.5 h-3.5" />
                          <span>좋아요</span>
                        </button>
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded hover:bg-primary/5">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>답글</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default PostDetail;