import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function MedicationTracker() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">{t('medications.title')}</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Medication Name</Label>
              <Input type="text" />
            </div>
            <div>
              <Label>Dosage</Label>
              <Input type="text" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Frequency</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="twice">Twice a day</SelectItem>
                  <SelectItem value="three">Three times a day</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration</Label>
              <Input type="number" placeholder="Number of days" />
            </div>
          </div>

          <Button className="w-full">Add Medication</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">Current Medications</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Placeholder for medication list */}
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Medication Name</h4>
                  <p className="text-sm text-gray-500">Dosage: 10mg</p>
                </div>
                <Button variant="outline" size="sm">
                  Mark Taken
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
