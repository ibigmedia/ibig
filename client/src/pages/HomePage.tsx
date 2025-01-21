import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MedicalForm } from '@/components/medical/MedicalForm';
import { AppointmentScheduler } from '@/components/appointments/AppointmentScheduler';
import { MedicationTracker } from '@/components/medications/MedicationTracker';

export function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="medical" className="space-y-6">
        <TabsList>
          <TabsTrigger value="medical">{t('nav.medical')}</TabsTrigger>
          <TabsTrigger value="appointments">{t('nav.appointments')}</TabsTrigger>
          <TabsTrigger value="medications">{t('nav.medications')}</TabsTrigger>
        </TabsList>

        <TabsContent value="medical">
          <MedicalForm />
        </TabsContent>

        <TabsContent value="appointments">
          <AppointmentScheduler />
        </TabsContent>

        <TabsContent value="medications">
          <MedicationTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
