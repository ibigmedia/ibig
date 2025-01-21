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
    <div className="container mx-auto px-4 py-6">
      <Card className="w-full">
        <CardHeader className="px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-bold">개인정보 관리</h2>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full grid grid-cols-2 gap-2 p-2">
              <TabsTrigger value="profile" className="text-sm px-2 py-1.5">기본 정보</TabsTrigger>
              <TabsTrigger value="emergency" className="text-sm px-2 py-1.5">비상연락처</TabsTrigger>
            </TabsList>

            <div className="p-4 sm:p-0">
              <TabsContent value="profile">
                <UserProfile />
              </TabsContent>

              <TabsContent value="emergency">
                <EmergencyContacts />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}