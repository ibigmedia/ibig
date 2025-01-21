import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Header } from "@/components/common/Header";
import { HomePage } from "@/pages/HomePage";
import { AdminPage } from "@/pages/AdminPage";
import AuthPage from "@/pages/auth-page";
import { useUser } from "@/hooks/use-user";

function Router() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/admin" component={AdminPage} />
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
          <main>
            <Router />
          </main>
        </div>
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
