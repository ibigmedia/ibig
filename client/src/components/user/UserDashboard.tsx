import React from 'react';
import { useUser } from '@/hooks/use-user';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { User, Calendar, Pill } from 'lucide-react';

interface UserDashboardProps {
  onTabChange: (tab: string) => void;
}

export function UserDashboard({ onTabChange }: UserDashboardProps) {
  const { user } = useUser();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>환영합니다!</CardTitle>
          <CardDescription>
            {user?.username}님의 개인 대시보드입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">개인정보</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                개인정보와 비상연락망을 관리할 수 있습니다
              </p>
              <Link href="/personal">
                <Button variant="outline" className="w-full">
                  개인정보 관리하기
                </Button>
              </Link>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Pill className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">투약관리</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                복용중인 약물을 관리하고 기록하세요
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onTabChange('medication')}
              >
                투약관리 보기
              </Button>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">진료예약</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                진료 예약을 관리하고 확인하세요
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onTabChange('appointment')}
              >
                예약 확인하기
              </Button>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}