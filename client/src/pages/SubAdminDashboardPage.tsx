import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { UserManagement } from '@/components/admin/UserManagement';
import { MedicalRecordsManagement } from '@/components/admin/MedicalRecordsManagement';
import { AppointmentManagement } from '@/components/admin/AppointmentManagement';
import { EmergencyContactsManagement } from '@/components/admin/EmergencyContactsManagement';
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { ChangePasswordDialog } from '@/components/admin/ChangePasswordDialog';

export function SubAdminDashboardPage() {
  const { t } = useLanguage();
  const [showPasswordDialog, setShowPasswordDialog] = React.useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">서브관리자 대시보드</h1>
            <p className="text-muted-foreground">
              서브관리자 대시보드입니다. 의료 기록, 예약 및 응급 연락처를 관리할 수 있습니다.
            </p>
          </div>
          <div className="flex gap-2">
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

      <Tabs defaultValue="medical-records" className="space-y-6">
        <TabsList>
          <TabsTrigger value="medical-records">의료 기록</TabsTrigger>
          <TabsTrigger value="appointments">예약 관리</TabsTrigger>
          <TabsTrigger value="emergency">응급 연락처</TabsTrigger>
        </TabsList>

        <TabsContent value="medical-records">
          <MedicalRecordsManagement />
        </TabsContent>

        <TabsContent value="appointments">
          <AppointmentManagement />
        </TabsContent>

        <TabsContent value="emergency">
          <EmergencyContactsManagement />
        </TabsContent>
      </Tabs>

      <ChangePasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      />
    </div>
  );
}