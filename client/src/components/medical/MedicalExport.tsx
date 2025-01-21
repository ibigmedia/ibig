import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';

export function MedicalExport() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const response = await fetch('/api/medical-records/export', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Create a blob from the data
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medical-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: t('auth.success'),
        description: t('medical.exportSuccess'),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('auth.error'),
        description: t('medical.exportError'),
      });
    }
  };

  return (
    <Button onClick={handleExport} variant="outline" className="w-full">
      <Download className="mr-2 h-4 w-4" />
      {t('medical.export')}
    </Button>
  );
}
