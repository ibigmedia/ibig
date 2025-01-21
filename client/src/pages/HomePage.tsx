import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MedicalForm } from '@/components/medical/MedicalForm';
import { AppointmentScheduler } from '@/components/appointments/AppointmentScheduler';
import { MedicationTracker } from '@/components/medications/MedicationTracker';
import { WelcomePage } from '@/components/common/WelcomePage';
import { useLocation, useSearch } from 'wouter';

export function HomePage() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const [search] = useSearch();

  // Check if welcome page has been shown before
  const [showWelcome, setShowWelcome] = React.useState(() => {
    const welcomeShown = localStorage.getItem('welcomeShown');
    return !welcomeShown;
  });

  // Parse the tab from URL
  const tab = new URLSearchParams(search).get('tab') || 'medical';

  // When user clicks to start, save that welcome has been shown
  const handleStartClick = () => {
    localStorage.setItem('welcomeShown', 'true');
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
            시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue={tab} className="space-y-6">
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