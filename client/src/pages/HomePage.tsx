import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MedicalForm } from '@/components/medical/MedicalForm';
import { AppointmentScheduler } from '@/components/appointments/AppointmentScheduler';
import { MedicationManagement } from '@/components/medical/MedicationManagement';
import { EmergencyContacts } from '@/components/medical/EmergencyContacts';
import { PersonalInfoForm } from '@/components/personal/PersonalInfoForm';
import { WelcomePage } from '@/components/common/WelcomePage';
import { Card, CardContent } from '@/components/ui/card';

export function HomePage() {
  const { t } = useLanguage();
  const [showWelcome, setShowWelcome] = React.useState(true);

  if (showWelcome) {
    return (
      <div className="container mx-auto px-4 py-8">
        <WelcomePage onStart={() => setShowWelcome(false)} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="flex w-full justify-start border-b">
          <TabsTrigger value="personal" className="text-lg px-6 py-2">
            {t('nav.personal')}
          </TabsTrigger>
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

        <TabsContent value="personal">
          <div className="grid gap-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('personal.basicInfo')}</h2>
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    {t('personal.basicInfoDescription')}
                  </p>
                </CardContent>
              </Card>
              <PersonalInfoForm />
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('personal.emergency')}</h2>
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    {t('personal.emergencyDescription')}
                  </p>
                </CardContent>
              </Card>
              <EmergencyContacts />
            </section>
          </div>
        </TabsContent>

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