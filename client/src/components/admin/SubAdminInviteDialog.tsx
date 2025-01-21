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
  DialogDescription,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { Mail } from "lucide-react";

interface SubAdminInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubAdminInviteDialog({ open, onOpenChange }: SubAdminInviteDialogProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/invite-subadmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "초대 완료",
        description: "서브관리자 초대 이메일이 발송되었습니다.",
      });
      setEmail("");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "초대 실패",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>서브관리자 초대</DialogTitle>
          <DialogDescription>
            초대할 서브관리자의 이메일 주소를 입력하세요.
            초대 이메일이 발송됩니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일 주소</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={inviteMutation.isPending}>
            <Mail className="w-4 h-4 mr-2" />
            {inviteMutation.isPending ? "초대 중..." : "초대 이메일 발송"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
