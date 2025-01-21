import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MedicalExport } from './MedicalExport';
import { EmergencyContacts } from './EmergencyContacts';

export function MedicalForm() {
  const { t } = useLanguage();
  const [isDiabetic, setIsDiabetic] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="w-48">
          <MedicalExport />
        </div>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">{t('medical.basicInfo')}</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('medical.name')}</Label>
              <Input type="text" />
            </div>
            <div>
              <Label>{t('medical.birthdate')}</Label>
              <Input type="date" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="diabetesCheck"
              checked={isDiabetic}
              onCheckedChange={(checked) => setIsDiabetic(checked as boolean)}
            />
            <Label htmlFor="diabetesCheck">{t('medical.diabetic')}</Label>
          </div>
        </CardContent>
      </Card>

      <EmergencyContacts />

      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">{t('medical.diseases')}</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input placeholder={t('medical.diagnosis')} />
            <Input type="date" placeholder={t('medical.diagnosisDate')} />
            <Input placeholder={t('medical.treatment')} />
          </div>
          <div>
            <Label>{t('medical.notes')}</Label>
            <Textarea className="h-24" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">{t('medical.allergies')}</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">{t('medical.drugAllergy')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder={t('medical.drugAllergy')} />
              <Input placeholder={t('medical.notes')} />
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">{t('medical.foodAllergy')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder={t('medical.foodAllergy')} />
              <Input placeholder={t('medical.notes')} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}