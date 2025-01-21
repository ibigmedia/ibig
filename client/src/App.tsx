import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { HomePage } from "@/pages/HomePage";
import { MedicalRecordsPage } from "@/pages/MedicalRecordsPage";
import { PersonalInfoPage } from "@/pages/PersonalInfoPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { SubAdminDashboardPage } from "@/pages/SubAdminDashboardPage";
import AuthPage from "@/pages/auth-page";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/common/Header";

function Router() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // 관리자와 서브관리자는 각각의 대시보드로 이동
  if (user.role === 'admin') {
    return <AdminDashboardPage />;
  }

  if (user.role === 'subadmin') {
    return <SubAdminDashboardPage />;
  }

  // 일반 사용자의 경우 기존 라우팅 유지
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <WouterRouter>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/personal" component={PersonalInfoPage} />
            <Route path="/medical-records" component={MedicalRecordsPage} />
            <Route component={NotFound} />
          </Switch>
        </WouterRouter>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Router />
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;