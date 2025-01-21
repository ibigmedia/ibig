import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MedicalHistory } from '@/components/medical/MedicalHistory';
import { AppointmentManagement } from '@/components/admin/AppointmentManagement';
import { MedicationManagement } from '@/components/medical/MedicationManagement';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';

export function HomePage() {
  const { t } = useLanguage();
  const { user } = useUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="health" className="space-y-6">
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

        <TabsContent value="health">
          <div className="space-y-6">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  귀하의 건강 기록을 확인하고 관리하세요
                </p>
              </CardContent>
            </Card>
            <MedicalHistory />
          </div>
        </TabsContent>

        <TabsContent value="medication">
          <div className="space-y-6">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  복용중인 약물을 관리하고 기록하세요
                </p>
              </CardContent>
            </Card>
            <MedicationManagement />
          </div>
        </TabsContent>

        <TabsContent value="appointment">
          <div className="space-y-6">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  진료 예약을 관리하고 확인하세요
                </p>
              </CardContent>
            </Card>
            <AppointmentManagement />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}