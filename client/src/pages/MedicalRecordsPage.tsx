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
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">의료기록 관리</h2>
          <p className="text-sm text-muted-foreground">
            개인정보와 의료기록을 관리할 수 있습니다.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList>
              <TabsTrigger value="personal">개인정보</TabsTrigger>
              <TabsTrigger value="emergency">비상연락처</TabsTrigger>
              <TabsTrigger value="history">병력 기록</TabsTrigger>
              <TabsTrigger value="diabetes">당뇨/혈당 관리</TabsTrigger>
              <TabsTrigger value="medications">약물 관리</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <PersonalInfoForm />
            </TabsContent>

            <TabsContent value="emergency">
              <EmergencyContacts />
            </TabsContent>

            <TabsContent value="history">
              <MedicalHistory />
            </TabsContent>

            <TabsContent value="diabetes">
              <DiabetesManagement />
            </TabsContent>

            <TabsContent value="medications">
              <MedicationManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}