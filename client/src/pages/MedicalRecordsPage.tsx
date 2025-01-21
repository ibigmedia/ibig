import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { MedicalHistory } from "@/components/medical/MedicalHistory";
import { DiabetesManagement } from "@/components/medical/DiabetesManagement";
import { MedicationManagement } from "@/components/medical/MedicationManagement";
import { PersonalInfoForm } from "@/components/personal/PersonalInfoForm";
import { EmergencyContacts } from "@/components/user/EmergencyContacts";

export function MedicalRecordsPage() {
  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-6">
      {/* 모바일에서는 작은 패딩, 데스크톱에서는 큰 패딩 */}
      <div className="mx-auto max-w-5xl">
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-3 py-4 sm:p-6">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              의료기록 관리
            </h2>
            <p className="text-sm text-muted-foreground">
              건강 정보와 의료기록을 관리할 수 있습니다
            </p>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs defaultValue="personal" className="w-full">
              <div className="border-b px-3 sm:px-6">
                <TabsList className="flex w-full gap-1 overflow-x-auto py-2 scrollbar-none">
                  <TabsTrigger 
                    value="personal" 
                    className="flex-shrink-0 whitespace-nowrap px-3 py-1.5 text-sm sm:text-base"
                  >
                    기본 정보
                  </TabsTrigger>
                  <TabsTrigger 
                    value="emergency" 
                    className="flex-shrink-0 whitespace-nowrap px-3 py-1.5 text-sm sm:text-base"
                  >
                    비상연락처
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="flex-shrink-0 whitespace-nowrap px-3 py-1.5 text-sm sm:text-base"
                  >
                    병력 기록
                  </TabsTrigger>
                  <TabsTrigger 
                    value="diabetes" 
                    className="flex-shrink-0 whitespace-nowrap px-3 py-1.5 text-sm sm:text-base"
                  >
                    당뇨 관리
                  </TabsTrigger>
                  <TabsTrigger 
                    value="medications" 
                    className="flex-shrink-0 whitespace-nowrap px-3 py-1.5 text-sm sm:text-base"
                  >
                    약물 관리
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-3 sm:p-6">
                <TabsContent value="personal" className="mt-0 focus-visible:outline-none">
                  <PersonalInfoForm />
                </TabsContent>

                <TabsContent value="emergency" className="mt-0 focus-visible:outline-none">
                  <EmergencyContacts />
                </TabsContent>

                <TabsContent value="history" className="mt-0 focus-visible:outline-none">
                  <MedicalHistory />
                </TabsContent>

                <TabsContent value="diabetes" className="mt-0 focus-visible:outline-none">
                  <DiabetesManagement />
                </TabsContent>

                <TabsContent value="medications" className="mt-0 focus-visible:outline-none">
                  <MedicationManagement />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}