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
    <div className="min-h-screen bg-background px-2 py-2 sm:container sm:mx-auto sm:px-4 sm:py-6">
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardHeader className="space-y-1.5 px-3 py-4 sm:px-6">
          <h2 className="text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
            의료기록 관리
          </h2>
          <p className="text-sm text-muted-foreground">
            개인정보와 의료기록을 관리할 수 있습니다.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="personal" className="w-full">
            <div className="border-b px-3 sm:px-6">
              <TabsList className="flex w-full overflow-x-auto space-x-2 py-2 scrollbar-none">
                <TabsTrigger 
                  value="personal" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none text-sm sm:text-base whitespace-nowrap"
                >
                  기본 정보
                </TabsTrigger>
                <TabsTrigger 
                  value="emergency" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none text-sm sm:text-base whitespace-nowrap"
                >
                  비상연락처
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none text-sm sm:text-base whitespace-nowrap"
                >
                  병력 기록
                </TabsTrigger>
                <TabsTrigger 
                  value="diabetes" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none text-sm sm:text-base whitespace-nowrap"
                >
                  당뇨 관리
                </TabsTrigger>
                <TabsTrigger 
                  value="medications" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none text-sm sm:text-base whitespace-nowrap"
                >
                  약물 관리
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="px-3 py-4 sm:px-6 sm:py-6">
              <TabsContent value="personal" className="mt-0 focus-visible:outline-none">
                <Card className="shadow-none border-0">
                  <CardContent className="p-0">
                    <PersonalInfoForm />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="emergency" className="mt-0 focus-visible:outline-none">
                <Card className="shadow-none border-0">
                  <CardContent className="p-0">
                    <EmergencyContacts />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-0 focus-visible:outline-none">
                <Card className="shadow-none border-0">
                  <CardContent className="p-0">
                    <MedicalHistory />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="diabetes" className="mt-0 focus-visible:outline-none">
                <Card className="shadow-none border-0">
                  <CardContent className="p-0">
                    <DiabetesManagement />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medications" className="mt-0 focus-visible:outline-none">
                <Card className="shadow-none border-0">
                  <CardContent className="p-0">
                    <MedicationManagement />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}