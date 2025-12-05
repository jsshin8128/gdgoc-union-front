import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { ChevronRight, MessageSquare } from "lucide-react";
import { 
  getAllPosts, 
  PostListItem, 
  postTypeToBoardName, 
  postTypeToBoardId 
} from "@/lib/api/posts";

interface BoardItem {
  id: string;
  name: string;
  description: string;
}

const Community = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<BoardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await getAllPosts();
        
        // API 응답을 게시판 목록으로 변환
        const boardList: BoardItem[] = response.posts.map((post: PostListItem) => ({
          id: postTypeToBoardId[post.postType] || post.postType.toLowerCase(),
          name: postTypeToBoardName[post.postType] || post.postType,
          description: post.title,
        }));
        
        setBoards(boardList);
        setError(null);
      } catch (err) {
        console.error("게시글 로딩 실패:", err);
        setError("게시글을 불러오는데 실패했습니다.");
        // 에러 시 기본 게시판 표시
        setBoards([
          { id: "free", name: "자유 게시판", description: "아직 게시글이 없습니다" },
          { id: "companion", name: "동행 게시판", description: "아직 게시글이 없습니다" },
          { id: "review", name: "후기 게시판", description: "아직 게시글이 없습니다" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">게시판 목록</h2>
          
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full p-4 bg-card rounded-xl border border-border/50 animate-pulse shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : boards.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border/50">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">아직 게시글이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {boards.map((board) => (
                <div key={board.id} className="relative group">
                  {/* 레딧 스타일 왼쪽 색상 바 */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/90 to-primary rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  
                  <button
                    onClick={() => navigate(`/board/${board.id}`)}
                    className="w-full flex items-center gap-4 p-5 bg-gradient-to-br from-card to-card/95 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-gradient-to-br hover:from-primary/5 hover:to-card transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-primary/5 text-left"
                  >
                    {/* 게시판 아이콘 영역 */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 group-hover:from-primary/25 group-hover:via-primary/15 group-hover:to-primary/10 transition-all duration-200 border border-primary/10 group-hover:border-primary/20 shadow-sm">
                      <MessageSquare className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-200" />
                    </div>
                    
                    {/* 게시판 정보 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-foreground mb-1.5 group-hover:text-primary transition-colors">
                        {board.name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate group-hover:text-foreground/80 transition-colors">
                        {board.description}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-200 group-hover:scale-105">
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </button>
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

export default Community;