import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MedicalForm } from '@/components/medical/MedicalForm';
import { AppointmentScheduler } from '@/components/appointments/AppointmentScheduler';
import { MedicationManagement } from '@/components/medical/MedicationManagement';
import { WelcomePage } from '@/components/common/WelcomePage';
import { EmergencyContacts } from '@/components/medical/EmergencyContacts';
import { useLocation } from 'wouter';

export function HomePage() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const [showWelcome, setShowWelcome] = React.useState(true);

  // When user clicks to start, move to main content
  const handleStartClick = () => {
    setShowWelcome(false);
  };

  if (showWelcome) {
    return (
      <div className="container mx-auto px-4 py-8">
        <WelcomePage />
        <div className="flex justify-center mt-8">
          <button
            onClick={handleStartClick}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {t('common.start')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="w-full justify-start border-b pb-px">
          <TabsTrigger value="personal">{t('tabs.personal')}</TabsTrigger>
          <TabsTrigger value="medical">{t('tabs.medical')}</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Tabs defaultValue="info" className="space-y-6">
            <TabsList className="w-full justify-start border-b pb-px">
              <TabsTrigger value="info">{t('tabs.basicInfo')}</TabsTrigger>
              <TabsTrigger value="emergency">{t('tabs.emergency')}</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <MedicalForm />
            </TabsContent>

            <TabsContent value="emergency">
              <EmergencyContacts />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="medical">
          <Tabs defaultValue="history" className="space-y-6">
            <TabsList className="w-full justify-start border-b pb-px">
              <TabsTrigger value="history">{t('tabs.history')}</TabsTrigger>
              <TabsTrigger value="appointments">{t('tabs.appointments')}</TabsTrigger>
              <TabsTrigger value="medications">{t('tabs.medications')}</TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <MedicalForm />
            </TabsContent>

            <TabsContent value="appointments">
              <AppointmentScheduler />
            </TabsContent>

            <TabsContent value="medications">
              <MedicationManagement />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}