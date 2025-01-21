import React from 'react';
import { useUser } from '@/hooks/use-user';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

export function Header() {
  const { user, logout } = useUser();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="text-lg font-bold">
              은혜의 강 헬스북
            </Button>
          </Link>

          <nav className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                <Link href="/">
                  <Button variant="ghost">대시보드</Button>
                </Link>
                <Link href="/personal">
                  <Button variant="ghost">개인정보</Button>
                </Link>
                <Link href="/medical-records">
                  <Button variant="ghost">의료기록</Button>
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage('ko')}>
                  한국어
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {user ? (
              <Button variant="outline" onClick={handleLogout}>
                로그아웃
              </Button>
            ) : (
              <Link href="/auth">
                <Button variant="outline">로그인</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}