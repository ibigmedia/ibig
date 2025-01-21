import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MedicalForm } from '@/components/medical/MedicalForm';
import { AppointmentScheduler } from '@/components/appointments/AppointmentScheduler';
import { MedicationTracker } from '@/components/medications/MedicationTracker';
import { WelcomePage } from '@/components/common/WelcomePage';
import { EmergencyContacts } from '@/components/medical/EmergencyContacts';
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
  const tab = new URLSearchParams(search).get('tab') || 'personal';

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
          <TabsTrigger value="personal">개인정보 관리</TabsTrigger>
          <TabsTrigger value="medical">의료기록 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Tabs defaultValue="info" className="space-y-6">
            <TabsList>
              <TabsTrigger value="info">기본정보</TabsTrigger>
              <TabsTrigger value="emergency">비상연락처</TabsTrigger>
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
            <TabsList>
              <TabsTrigger value="history">진료기록</TabsTrigger>
              <TabsTrigger value="appointments">예약관리</TabsTrigger>
              <TabsTrigger value="medications">약물관리</TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <MedicalForm />
            </TabsContent>

            <TabsContent value="appointments">
              <AppointmentScheduler />
            </TabsContent>

            <TabsContent value="medications">
              <MedicationTracker />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}