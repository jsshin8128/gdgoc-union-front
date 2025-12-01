import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { deleteAccount } from "@/lib/api/auth";
import { toast } from "sonner";

const AccountDelete = () => {
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount();
      // 회원탈퇴 시 모든 사용자 정보 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userNickname');
      localStorage.removeItem('userProfileImage');
      localStorage.removeItem('userRole');
      toast.success('회원탈퇴가 완료되었습니다.');
      navigate("/auth");
    } catch (error: any) {
      setIsDeleting(false);
      setIsConfirming(false);
      
      if (!error.response && error.request) {
        toast.error('네트워크 에러가 발생했습니다. 서버에 연결할 수 없습니다.');
        return;
      }
      
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        '회원탈퇴에 실패했습니다.';
      
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-12">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={handleCancel}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">회원탈퇴</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between pb-8">
        <div className="space-y-8">
          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-destructive/10">
              <AlertTriangle className="w-16 h-16 text-destructive" />
            </div>
          </div>

          {/* Warning Message */}
          <div className="space-y-4 text-center">
            {!isConfirming ? (
              <>
                <h2 className="text-xl font-semibold text-foreground">
                  정말 탈퇴하시겠습니까?
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  탈퇴하시면 모든 데이터가 삭제되며 복구할 수 없습니다.
                  <br />
                  신중히 결정해주세요.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-destructive">
                  최종 확인
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  탈퇴를 진행하시려면 아래 버튼을 다시 눌러주세요.
                  <br />
                  모든 데이터가 영구적으로 삭제됩니다.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          {isConfirming && (
            <Button
              variant="outline"
              className="w-full h-14 text-base font-medium border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all rounded-xl"
              onClick={() => setIsConfirming(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
          )}
          <Button
            variant="destructive"
            className="w-full h-14 text-base font-medium rounded-xl"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? '처리 중...' : isConfirming ? '탈퇴하기' : '탈퇴 진행'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountDelete;

