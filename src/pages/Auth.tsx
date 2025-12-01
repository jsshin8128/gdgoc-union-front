import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-16 max-w-md mx-auto">
      <div className="flex-1 flex flex-col justify-center">
        {/* Hero Section */}
        <div className="mb-20">
          <h1 className="text-6xl font-bold text-foreground mb-6" style={{ fontFamily: '"Stereofidelic", sans-serif' }}>
            BANDCHU
          </h1>
          <h2 className="text-2xl font-bold text-foreground mb-5 leading-tight">
            인디 아티스트와 팬을<br />잇는 플랫폼
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            팬의 발견, 아티스트의 도약
          </p>
        </div>

        {/* Auth Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-11 mb-6 bg-muted/30 rounded-lg">
            <TabsTrigger 
              value="login" 
              className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              로그인
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              회원가입
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-3 mt-0">
            <Button
              className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm"
              onClick={() => navigate("/login")}
            >
              일반 로그인
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 text-base font-medium border border-border bg-background hover:bg-accent/50 rounded-xl flex items-center justify-center gap-3"
              onClick={() => {
                toast.info('구글 로그인 기능은 현재 미구현입니다.');
              }}
            >
              <GoogleIcon className="w-5 h-5" />
              구글 로그인
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-3 mt-0">
            <Button
              className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm"
              onClick={() => navigate("/signup/type")}
            >
              일반 회원가입
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 text-base font-medium border border-border bg-background hover:bg-accent/50 rounded-xl flex items-center justify-center gap-3"
              onClick={() => {
                toast.info('구글 회원가입 기능은 현재 미구현입니다.');
              }}
            >
              <GoogleIcon className="w-5 h-5" />
              구글 회원가입
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;

