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
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertUserSchema } from "@db/schema";
import * as z from "zod";

export default function AuthPage() {
  const { t } = useLanguage();
  const { login, register } = useUser();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);

  const form = useForm({
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
          title: t('auth.error'),
          description: result.message,
        });
        return;
      }

      toast({
        title: t('auth.success'),
        description: isRegistering
          ? t('auth.registrationSuccess')
          : t('auth.loginSuccess'),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('auth.error'),
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <div className="container max-w-[400px] py-16">
      <Card>
        <CardHeader>
          <CardTitle>{isRegistering ? t('auth.register') : t('auth.login')}</CardTitle>
          <CardDescription>
            {isRegistering
              ? t('auth.registerDescription')
              : t('auth.loginDescription')}
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
                    <FormLabel>{t('auth.username')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>{t('auth.password')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                {isRegistering ? t('auth.register') : t('auth.login')}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering ? t('auth.haveAccount') : t('auth.needAccount')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}