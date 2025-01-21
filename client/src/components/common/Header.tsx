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
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" className="text-2xl font-bold px-0">
            Grace River Health
          </Button>
        </Link>

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
              {language === 'ko' ? '로그아웃' : 'Logout'}
            </Button>
          ) : (
            <Link href="/auth">
              <Button variant="outline">
                {language === 'ko' ? '로그인' : 'Login'}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}