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

export function MedicalRecordsPage() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">의료기록 관리</h2>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="history">
          <TabsList>
            <TabsTrigger value="history">병력 기록</TabsTrigger>
            <TabsTrigger value="diabetes">당뇨/혈당 관리</TabsTrigger>
            <TabsTrigger value="medications">약물 관리</TabsTrigger>
          </TabsList>

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
  );
}
