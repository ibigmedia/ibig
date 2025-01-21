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
    <div className="container mx-auto px-2 sm:px-4 py-4 max-w-3xl min-h-[calc(100vh-4rem)]">
      <Card className="w-full shadow-sm">
        <CardHeader className="px-3 py-4 sm:px-6">
          <h2 className="text-lg sm:text-2xl font-bold">개인정보 관리</h2>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="profile" className="w-full">
            <div className="px-3 sm:px-6 mb-4">
              <TabsList className="w-full grid grid-cols-2 gap-1 p-1 mx-auto">
                <TabsTrigger 
                  value="profile" 
                  className="text-sm py-1.5 px-2 whitespace-nowrap"
                >
                  기본 정보
                </TabsTrigger>
                <TabsTrigger 
                  value="emergency" 
                  className="text-sm py-1.5 px-2 whitespace-nowrap"
                >
                  비상연락처
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="px-3 sm:px-6 pb-6">
              <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
                <UserProfile />
              </TabsContent>

              <TabsContent value="emergency" className="mt-0 focus-visible:outline-none">
                <EmergencyContacts />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}