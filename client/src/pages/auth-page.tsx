import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@/hooks/use-user";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { insertUserSchema } from "@db/schema";
import * as z from "zod";

export default function AuthPage() {
  const { t } = useLanguage();
  const { login, register } = useUser();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);

  const form = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof insertUserSchema>) => {
    try {
      const result = isRegistering
        ? await register(values)
        : await login(values);

      if (!result.ok) {
        toast({
          variant: "destructive",
          title: "오류",
          description: result.message,
        });
        return;
      }

      toast({
        title: "성공",
        description: isRegistering
          ? "회원가입이 완료되었습니다"
          : "로그인되었습니다",
      });

      setLocation("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "오류",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-center">
            {isRegistering ? "회원가입" : "로그인"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>아이디</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="아이디를 입력하세요" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="비밀번호를 입력하세요" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <Button type="submit" className="w-full">
                  {isRegistering ? "회원가입" : "로그인"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full mt-2"
                  onClick={() => setIsRegistering(!isRegistering)}
                >
                  {isRegistering
                    ? "이미 계정이 있으신가요? 로그인하기"
                    : "계정이 없으신가요? 회원가입하기"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}