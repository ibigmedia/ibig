import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
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
    <div className="container mx-auto p-2 sm:p-4 md:p-8">
      <Card className="mb-4 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">서브관리자 대시보드</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              의료 기록, 예약 및 응급 연락처를 관리할 수 있습니다.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPasswordDialog(true)}
            className="w-full sm:w-auto"
          >
            <Settings className="h-4 w-4 mr-2" />
            비밀번호 변경
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="medical-records" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="medical-records" className="text-sm">의료 기록</TabsTrigger>
          <TabsTrigger value="appointments" className="text-sm">예약 관리</TabsTrigger>
          <TabsTrigger value="emergency" className="text-sm">응급 연락처</TabsTrigger>
        </TabsList>

        <TabsContent value="medical-records" className="mt-2">
          <div className="bg-card rounded-lg p-2 sm:p-4">
            <MedicalRecordsManagement />
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="mt-2">
          <div className="bg-card rounded-lg p-2 sm:p-4">
            <AppointmentManagement />
          </div>
        </TabsContent>

        <TabsContent value="emergency" className="mt-2">
          <div className="bg-card rounded-lg p-2 sm:p-4">
            <EmergencyContactsManagement />
          </div>
        </TabsContent>
      </Tabs>

      <ChangePasswordDialog 
        open={showPasswordDialog} 
        onOpenChange={setShowPasswordDialog}
      />
    </div>
  );
}
