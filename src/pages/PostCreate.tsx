import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
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
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-foreground">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">글쓰기</h1>
          </div>
          <Button onClick={handleSubmit} size="sm" disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "등록"}
          </Button>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-4">
        <div className="text-sm text-muted-foreground mb-4">
          {boardIdToBoardName[boardId || ""] || "게시판"}
        </div>
        
        <div className="space-y-4">
          <Input
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg"
          />
          <Textarea
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px]"
          />
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default PostCreate;