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
    <div className="min-h-screen bg-background px-2 py-2 sm:container sm:mx-auto sm:px-4 sm:py-6">
      <Card className="mx-auto w-full max-w-3xl shadow-sm">
        <CardHeader className="space-y-1.5 px-3 py-4 sm:px-6">
          <h2 className="text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
            Grace River Health
          </h2>
          <p className="text-sm text-muted-foreground">
            개인정보 관리
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="profile" className="w-full">
            <div className="border-b px-3 sm:px-6">
              <TabsList className="grid h-12 w-full grid-cols-2 gap-1 rounded-none p-1">
                <TabsTrigger 
                  value="profile" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none text-sm sm:text-base"
                >
                  기본 정보
                </TabsTrigger>
                <TabsTrigger 
                  value="emergency" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none text-sm sm:text-base"
                >
                  비상연락처
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="px-3 py-4 sm:px-6 sm:py-6">
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