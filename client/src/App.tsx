import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { HomePage } from "@/pages/HomePage";
import { UserDashboardPage } from "@/pages/UserDashboardPage";
import AuthPage from "@/pages/auth-page";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/common/Header";
import { AdminPage } from "@/pages/AdminPage";
import { SubAdminDashboardPage } from "@/pages/SubAdminDashboardPage";
import { InvitationPage } from "@/pages/InvitationPage";

function Router() {
  const { user, isLoading } = useUser();

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Invitation page should be accessible without authentication
  const token = new URLSearchParams(window.location.search).get('token');
  if (token) {
    return <InvitationPage />;
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage />;
  }

  // Show admin dashboard for admin users
  if (user.role === 'admin') {
    return (
      <Switch>
        <Route path="/" component={AdminPage} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Show subadmin dashboard for subadmin users
  if (user.role === 'subadmin') {
    return (
      <Switch>
        <Route path="/" component={SubAdminDashboardPage} />
        <Route path="/subadmin" component={SubAdminDashboardPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Show regular user pages for non-admin users
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/dashboard" component={UserDashboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Router />
          </main>
        </div>
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;