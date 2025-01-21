import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { HomePage } from "@/pages/HomePage";
import { UserDashboardPage } from "@/pages/UserDashboardPage";
import { MedicalRecordsPage } from "@/pages/MedicalRecordsPage";
import { PersonalInfoPage } from "@/pages/PersonalInfoPage";
import AuthPage from "@/pages/auth-page";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/common/Header";
import { AdminPage } from "@/pages/AdminPage";
import { SubAdminDashboardPage } from "@/pages/SubAdminDashboardPage";
import { InvitationPage } from "@/pages/InvitationPage";

function Router() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const token = new URLSearchParams(window.location.search).get('token');
  if (token) {
    return <InvitationPage />;
  }

  if (!user) {
    return <AuthPage />;
  }

  if (user.role === 'admin') {
    return (
      <Switch>
        <Route path="/" component={AdminPage} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  if (user.role === 'subadmin') {
    return (
      <Switch>
        <Route path="/" component={SubAdminDashboardPage} />
        <Route path="/subadmin" component={SubAdminDashboardPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/dashboard" component={UserDashboardPage} />
      <Route path="/medical-records" component={MedicalRecordsPage} />
      <Route path="/personal" component={PersonalInfoPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
        </div>
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;