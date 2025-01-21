import React from 'react';
import { UserDashboard } from '@/components/user/UserDashboard';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function UserDashboardPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <nav className="flex space-x-4">
          <Link href="/">
            <Button variant="ghost">{t('nav.health')}</Button>
          </Link>
          <Link href="/?tab=appointments">
            <Button variant="ghost">{t('nav.appointment')}</Button>
          </Link>
          <Link href="/?tab=medications">
            <Button variant="ghost">{t('nav.medication')}</Button>
          </Link>
        </nav>
      </div>
      <UserDashboard />
    </div>
  );
}