import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function WelcomePage() {
  const { t } = useLanguage();

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="pt-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-4">{t('welcome.title')}</h1>
          <p className="text-muted-foreground">{t('welcome.description')}</p>
        </div>

        <Separator />

        <div>
          <h2 className="text-2xl font-semibold mb-4">{t('welcome.purposeTitle')}</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>{t('welcome.purpose1')}</li>
            <li>{t('welcome.purpose2')}</li>
            <li>{t('welcome.purpose3')}</li>
          </ul>
        </div>

        <Separator />

        <div>
          <h2 className="text-2xl font-semibold mb-4">{t('welcome.howToUseTitle')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold">{t('welcome.section1Title')}</h3>
              <p className="text-sm text-muted-foreground">{t('welcome.section1Description')}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">{t('welcome.section2Title')}</h3>
              <p className="text-sm text-muted-foreground">{t('welcome.section2Description')}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">{t('welcome.section3Title')}</h3>
              <p className="text-sm text-muted-foreground">{t('welcome.section3Description')}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">{t('welcome.section4Title')}</h3>
              <p className="text-sm text-muted-foreground">{t('welcome.section4Description')}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">{t('welcome.section5Title')}</h3>
              <p className="text-sm text-muted-foreground">{t('welcome.section5Description')}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="bg-primary/5 p-4 rounded-lg">
          <p className="text-sm text-center italic">
            {t('welcome.reminder')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
