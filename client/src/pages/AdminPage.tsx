import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dashboard } from '@/components/admin/Dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { UserManagement } from '@/components/admin/UserManagement';
import { MedicalRecordsManagement } from '@/components/admin/MedicalRecordsManagement';
import { AppointmentManagement } from '@/components/admin/AppointmentManagement';
import { EmergencyContactsManagement } from '@/components/admin/EmergencyContactsManagement';
import { SubAdminManagement } from '@/components/admin/SubAdminManagement';
import { Button } from "@/components/ui/button";
import { Settings, Mail } from "lucide-react";
import { ChangePasswordDialog } from '@/components/admin/ChangePasswordDialog';
import { SmtpSettingsDialog } from '@/components/admin/SmtpSettingsDialog';

export function AdminPage() {
  const { t } = useLanguage();
  const [showPasswordDialog, setShowPasswordDialog] = React.useState(false);
  const [showSmtpDialog, setShowSmtpDialog] = React.useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">{t('admin.dashboard')}</h1>
            <p className="text-muted-foreground">
              {t('admin.dashboard.description')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSmtpDialog(true)}
            >
              <Mail className="h-4 w-4 mr-2" />
              이메일 설정
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              비밀번호 변경
            </Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">{t('admin.tabs.dashboard')}</TabsTrigger>
          <TabsTrigger value="users">{t('admin.tabs.users')}</TabsTrigger>
          <TabsTrigger value="medical-records">{t('admin.tabs.medical-records')}</TabsTrigger>
          <TabsTrigger value="appointments">{t('admin.tabs.appointments')}</TabsTrigger>
          <TabsTrigger value="emergency">{t('admin.tabs.emergency')}</TabsTrigger>
          <TabsTrigger value="subadmins">{t('admin.tabs.subadmins')}</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
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

        <TabsContent value="subadmins">
          <SubAdminManagement />
        </TabsContent>
      </Tabs>

      <ChangePasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      />
      <SmtpSettingsDialog
        open={showSmtpDialog}
        onOpenChange={setShowSmtpDialog}
      />
    </div>
  );
}