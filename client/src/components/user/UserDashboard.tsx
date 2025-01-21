import React from 'react';
import { useUser } from '@/hooks/use-user';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

export function UserDashboard() {
  const { user } = useUser();
  const { t } = useLanguage();
  const { toast } = useToast();

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
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">개인정보 관리</h3>
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
              <h3 className="font-semibold mb-2">의료 기록</h3>
              <p className="text-sm text-muted-foreground mb-4">
                의료 기록과 약물 관리를 확인할 수 있습니다
              </p>
              <Link href="/medical-records">
                <Button variant="outline" className="w-full">
                  의료 기록 보기
                </Button>
              </Link>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}