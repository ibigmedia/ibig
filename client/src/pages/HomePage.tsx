import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserDashboard } from '@/components/user/UserDashboard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MedicationTracker } from '@/components/medications/MedicationTracker';
import { useQuery } from '@tanstack/react-query';
import { AppointmentScheduler } from '@/components/appointments/AppointmentScheduler';
import { MedicalHistory } from '@/components/medical/MedicalHistory';

export function HomePage() {
  const { t } = useLanguage();
  const { data: medicalRecords } = useQuery({
    queryKey: ['/api/medical-records'],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <UserDashboard />

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="health" className="space-y-6 tabs-section">
              <TabsList className="flex w-full justify-start border-b">
                <TabsTrigger value="health" className="text-lg px-6 py-2">
                  건강기록
                </TabsTrigger>
                <TabsTrigger value="medication" className="text-lg px-6 py-2">
                  투약관리
                </TabsTrigger>
                <TabsTrigger value="appointment" className="text-lg px-6 py-2">
                  진료예약
                </TabsTrigger>
              </TabsList>

              <TabsContent value="health" className="mt-0 focus-visible:outline-none">
                <div className="bg-card rounded-lg p-4 sm:p-6">
                  <MedicalHistory />
                </div>
              </TabsContent>

              <TabsContent value="medication">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">투약 관리</h3>
                  <p className="text-muted-foreground">
                    복용중인 약물을 관리하고 기록하세요
                  </p>
                  <MedicationTracker />
                </div>
              </TabsContent>

              <TabsContent value="appointment">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">진료 예약</h3>
                  <p className="text-muted-foreground">
                    진료 예약을 관리하고 확인하세요
                  </p>
                  <AppointmentScheduler />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}