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
      {/* 메인 탭 */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="w-full justify-start border-b pb-px">
          {/* 개인정보 관리 탭 */}
          <TabsTrigger value="personal" className="text-lg">
            {t('tabs.personalInfo')}
          </TabsTrigger>
          {/* 의료정보 관리 탭 */}
          <TabsTrigger value="medical" className="text-lg">
            {t('tabs.medicalInfo')}
          </TabsTrigger>
        </TabsList>

        {/* 개인정보 관리 섹션 */}
        <TabsContent value="personal">
          <div className="grid gap-6">
            <section>
              <h2 className="text-xl font-semibold mb-4">{t('sections.basicInfo')}</h2>
              <MedicalForm />
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4">{t('sections.emergency')}</h2>
              <EmergencyContacts />
            </section>
          </div>
        </TabsContent>

        {/* 의료정보 관리 섹션 */}
        <TabsContent value="medical">
          <div className="grid gap-6">
            <section>
              <h2 className="text-xl font-semibold mb-4">{t('sections.healthRecords')}</h2>
              <MedicalForm isHealthRecordOnly />
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4">{t('sections.medications')}</h2>
              <MedicationManagement />
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4">{t('sections.appointments')}</h2>
              <AppointmentScheduler />
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}