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
  CardDescription,
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
  FormDescription,
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
    <div className="container max-w-[400px] py-16">
      <Card>
        <CardHeader>
          <CardTitle>{isRegistering ? "회원가입" : "로그인"}</CardTitle>
          <CardDescription>
            {isRegistering
              ? "새로운 계정을 만들어주세요"
              : "아이디와 비밀번호를 입력하세요"}
          </CardDescription>
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
                      <Input placeholder="아이디를 입력하세요" {...field} />
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
                      <Input type="password" placeholder="비밀번호를 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                {isRegistering ? "회원가입" : "로그인"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering
                  ? "이미 계정이 있으신가요? 로그인하기"
                  : "계정이 없으신가요? 회원가입하기"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}