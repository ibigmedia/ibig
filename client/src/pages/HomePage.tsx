import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MedicalForm } from '@/components/medical/MedicalForm';
import { AppointmentScheduler } from '@/components/appointments/AppointmentScheduler';
import { MedicationManagement } from '@/components/medical/MedicationManagement';
import { EmergencyContacts } from '@/components/medical/EmergencyContacts';
import { PersonalInfoForm } from '@/components/personal/PersonalInfoForm';

export function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="flex w-full justify-start border-b">
          <TabsTrigger value="personal" className="text-lg px-6 py-2">
            개인정보
          </TabsTrigger>
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

        {/* 개인정보 탭 */}
        <TabsContent value="personal">
          <div className="grid gap-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">기본 정보</h2>
              <PersonalInfoForm />
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">비상 연락망</h2>
              <EmergencyContacts />
            </section>
          </div>
        </TabsContent>

        {/* 건강기록 탭 */}
        <TabsContent value="health">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">건강 기록</h2>
            <MedicalForm />
          </div>
        </TabsContent>

        {/* 투약관리 탭 */}
        <TabsContent value="medication">
          <div className="space-y-6">
            <MedicationManagement />
          </div>
        </TabsContent>

        {/* 진료예약 탭 */}
        <TabsContent value="appointment">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">진료 예약</h2>
            <AppointmentScheduler />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}