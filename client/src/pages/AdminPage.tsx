import React from 'react';
import { Dashboard } from '@/components/admin/Dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { UserManagement } from '@/components/admin/UserManagement';
import { MedicalRecordsManagement } from '@/components/admin/MedicalRecordsManagement';
import { AppointmentManagement } from '@/components/admin/AppointmentManagement';

export function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6 p-6">
        <h1 className="text-2xl font-bold mb-2">관리자 대시보드</h1>
        <p className="text-muted-foreground">
          사용자와 의료 기록을 관리하고 예약 현황을 모니터링하세요
        </p>
      </Card>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">대시보드</TabsTrigger>
          <TabsTrigger value="users">사용자 관리</TabsTrigger>
          <TabsTrigger value="medical-records">의료기록 관리</TabsTrigger>
          <TabsTrigger value="appointments">예약 관리</TabsTrigger>
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
      </Tabs>
    </div>
  );
}