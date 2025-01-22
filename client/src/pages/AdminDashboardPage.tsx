import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/hooks/use-user';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Mail, LogOut } from 'lucide-react';
import { Dashboard } from '@/components/admin/Dashboard';
import { UserManagement } from '@/components/admin/UserManagement';
import { MedicalRecordsManagement } from '@/components/admin/MedicalRecordsManagement';
import { AppointmentManagement } from '@/components/admin/AppointmentManagement';
import { EmergencyContactsManagement } from '@/components/admin/EmergencyContactsManagement';
import { SubAdminManagement } from '@/components/admin/SubAdminManagement';
import { SmtpSettingsDialog } from '@/components/admin/SmtpSettingsDialog';
import { SubAdminInviteDialog } from '@/components/admin/SubAdminInviteDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export function AdminDashboardPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { logout } = useUser();
  const [showSmtpSettings, setShowSmtpSettings] = React.useState(false);
  const [showInviteDialog, setShowInviteDialog] = React.useState(false);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (!result.ok) {
        throw new Error(result.message);
      }
      toast({
        title: "로그아웃 성공",
        description: "성공적으로 로그아웃되었습니다.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "로그아웃 실패",
        description: error.message,
      });
    }
  };

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
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">대시보드</TabsTrigger>
          <TabsTrigger value="users">사용자 관리</TabsTrigger>
          <TabsTrigger value="medical-records">의료 기록관리</TabsTrigger>
          <TabsTrigger value="appointments">예약 관리</TabsTrigger>
          <TabsTrigger value="emergency">비상연락처 관리</TabsTrigger>
          <TabsTrigger value="subadmin">서브관리자 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Dashboard />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="medical-records">
          <MedicalRecordsManagement />
        </TabsContent>

        <TabsContent value="appointments">
          <AppointmentManagement />
        </TabsContent>

        <TabsContent value="emergency">
          <EmergencyContactsManagement />
        </TabsContent>

        <TabsContent value="subadmin">
          <SubAdminManagement />
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