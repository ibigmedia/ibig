import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Mail } from 'lucide-react';
import { Dashboard } from '@/components/admin/Dashboard';
import { UserManagement } from '@/components/admin/UserManagement';
import { SmtpSettingsDialog } from '@/components/admin/SmtpSettingsDialog';
import { SubAdminInviteDialog } from '@/components/admin/SubAdminInviteDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AdminDashboardPage() {
  const { t } = useLanguage();
  const [showSmtpSettings, setShowSmtpSettings] = React.useState(false);
  const [showInviteDialog, setShowInviteDialog] = React.useState(false);

  return (
    <div className="container mx-auto p-2 sm:p-4 md:p-8">
      <Card className="mb-4 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">관리자 대시보드</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              시스템 관리 및 사용자를 관리할 수 있습니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteDialog(true)}
            >
              <Mail className="h-4 w-4 mr-2" />
              서브관리자 초대
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSmtpSettings(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              이메일 설정
            </Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">대시보드</TabsTrigger>
          <TabsTrigger value="users">사용자 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Dashboard />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>

      <SmtpSettingsDialog
        open={showSmtpSettings}
        onOpenChange={setShowSmtpSettings}
      />
      
      <SubAdminInviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />
    </div>
  );
}
