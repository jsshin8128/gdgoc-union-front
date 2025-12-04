import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { createPost, boardIdToPostType, boardIdToBoardName } from "@/lib/api/posts";

const PostCreate = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    const postType = boardIdToPostType[boardId || ""];
    if (!postType) {
      toast.error("잘못된 게시판입니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPost({
        postType,
        title: title.trim(),
        content: content.trim(),
      });
      toast.success("게시글이 등록되었습니다.");
      navigate(`/board/${boardId}`);
    } catch (error) {
      console.error("게시글 작성 실패:", error);
      toast.error("게시글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-lg font-semibold text-foreground">글쓰기</h1>
          </div>
          <Button 
            onClick={handleSubmit} 
            size="sm" 
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="h-9 px-4 rounded-lg bg-primary hover:bg-primary/90 text-sm font-medium"
          >
            {isSubmitting ? "등록 중..." : "등록"}
          </Button>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-4">
        {/* 게시판 정보 카드 */}
        <div className="bg-card rounded-xl border border-border/50 p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">게시판</p>
              <p className="text-sm font-semibold text-foreground">{boardIdToBoardName[boardId || ""] || "게시판"}</p>
            </div>
          </div>
        </div>
        
        {/* 작성 폼 */}
        <div className="bg-card rounded-xl border border-border/50 p-5 shadow-sm space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">제목</label>
            <Input
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 text-base border-border/50 rounded-lg bg-background focus:border-primary"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">내용</label>
            <Textarea
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] text-base border-border/50 rounded-lg bg-background focus:border-primary resize-none"
            />
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default PostCreate;