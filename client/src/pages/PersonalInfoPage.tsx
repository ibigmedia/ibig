import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { PersonalInfoForm } from '@/components/personal/PersonalInfoForm';

export function PersonalInfoPage() {
  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-6">
      <div className="mx-auto max-w-3xl">
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-3 py-4 sm:p-6">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              개인정보 관리
            </h2>
            <p className="text-sm text-muted-foreground">
              개인정보와 건강정보를 관리할 수 있습니다
            </p>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <PersonalInfoForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
