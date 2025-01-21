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
import { Moon, Sun, Globe, Menu } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

export function Header() {
  const { user, logout } = useUser();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <Link href="/">
            <Button variant="ghost" className="text-lg md:text-2xl font-bold px-0">
              {t('common.appName')}
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user && user.role === 'user' && (
              <>
                <Link href="/personal">
                  <Button variant="ghost">
                    {t('nav.personal')}
                  </Button>
                </Link>
                <Link href="/medical-records">
                  <Button variant="ghost">
                    {t('nav.health')}
                  </Button>
                </Link>
              </>
            )}

            {user && user.role === 'admin' && (
              <Link href="/admin">
                <Button variant="ghost">
                  {t('nav.admin')}
                </Button>
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage('ko')}>
                  {t('language.korean')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  {t('language.english')}
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
                {t('auth.logout')}
              </Button>
            ) : (
              <Link href="/auth">
                <Button variant="outline">
                  {t('auth.login')}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            {user && user.role === 'user' && (
              <>
                <Link href="/personal">
                  <Button variant="ghost" className="w-full justify-start">
                    {t('nav.personal')}
                  </Button>
                </Link>
                <Link href="/medical-records">
                  <Button variant="ghost" className="w-full justify-start">
                    {t('nav.health')}
                  </Button>
                </Link>
              </>
            )}

            {user && user.role === 'admin' && (
              <Link href="/admin">
                <Button variant="ghost" className="w-full justify-start">
                  {t('nav.admin')}
                </Button>
              </Link>
            )}

            <div className="flex items-center justify-between px-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
              >
                <Globe className="h-5 w-5" />
              </Button>

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
                  {t('auth.logout')}
                </Button>
              ) : (
                <Link href="/auth">
                  <Button variant="outline">
                    {t('auth.login')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}