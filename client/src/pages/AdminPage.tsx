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

export function AdminPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6 p-6">
        <h1 className="text-2xl font-bold mb-2">{t('admin.dashboard')}</h1>
        <p className="text-muted-foreground">
          {t('admin.dashboard.description')}
        </p>
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
    </div>
  );
}