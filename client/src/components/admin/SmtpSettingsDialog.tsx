import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  fromEmail: string;
}

interface SmtpSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SmtpSettingsDialog({ open, onOpenChange }: SmtpSettingsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fromEmail, setFromEmail] = useState("");

  const { data: settings } = useQuery<SmtpSettings>({
    queryKey: ['/api/admin/smtp-settings'],
    onSuccess: (data) => {
      if (data) {
        setHost(data.host);
        setPort(data.port.toString());
        setUsername(data.username);
        setFromEmail(data.fromEmail);
      }
    }
  });

  const updateSettings = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/smtp-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host,
          port: parseInt(port),
          username,
          password: password || undefined,
          fromEmail,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "SMTP 설정이 업데이트되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/smtp-settings'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "오류",
        description: error.message,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이메일 알림 설정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="host">SMTP 서버</Label>
            <Input
              id="host"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="예: smtp.gmail.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">포트</Label>
            <Input
              id="port"
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="예: 587"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">사용자 이름</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="예: your-email@gmail.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={settings ? "기존 비밀번호 유지" : "SMTP 비밀번호 입력"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromEmail">발신자 이메일</Label>
            <Input
              id="fromEmail"
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="예: noreply@your-domain.com"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "저장 중..." : "설정 저장"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}