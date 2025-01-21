import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MedicalForm } from '@/components/medical/MedicalForm';
import { AppointmentScheduler } from '@/components/appointments/AppointmentScheduler';
import { MedicationManagement } from '@/components/medical/MedicationManagement';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import { WelcomePage } from '@/components/common/WelcomePage';

export function HomePage() {
  const { t } = useLanguage();
  const { user } = useUser();
  const [showWelcome, setShowWelcome] = React.useState(() => {
    const hasSeenWelcome = localStorage.getItem(`hasSeenWelcome_${user?.id}`);
    return !hasSeenWelcome;
  });

  const handleStart = () => {
    localStorage.setItem(`hasSeenWelcome_${user?.id}`, 'true');
    setShowWelcome(false);
  };

  if (showWelcome) {
    return (
      <div className="container mx-auto px-4 py-8">
        <WelcomePage onStart={handleStart} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="health" className="space-y-6">
        <TabsList className="flex w-full justify-start border-b">
          <TabsTrigger value="health" className="text-lg px-6 py-2">
            {t('nav.health')}
          </TabsTrigger>
          <TabsTrigger value="medication" className="text-lg px-6 py-2">
            {t('nav.medication')}
          </TabsTrigger>
          <TabsTrigger value="appointment" className="text-lg px-6 py-2">
            {t('nav.appointment')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">{t('health.records')}</h2>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  {t('health.recordsDescription')}
                </p>
              </CardContent>
            </Card>
            <MedicalForm />
          </div>
        </TabsContent>

        <TabsContent value="medication">
          <div className="space-y-6">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  {t('medication.description')}
                </p>
              </CardContent>
            </Card>
            <MedicationManagement />
          </div>
        </TabsContent>

        <TabsContent value="appointment">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">{t('appointment.title')}</h2>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  {t('appointment.description')}
                </p>
              </CardContent>
            </Card>
            <AppointmentScheduler />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}