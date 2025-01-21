import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useUser } from "@/hooks/use-user";
import { UserProfile } from "@/components/user/UserProfile";
import { EmergencyContacts } from "@/components/user/EmergencyContacts";

export function PersonalInfoPage() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">개인정보 관리</h2>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">기본 정보</TabsTrigger>
            <TabsTrigger value="emergency">비상연락처</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <UserProfile />
          </TabsContent>
          
          <TabsContent value="emergency">
            <EmergencyContacts />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
