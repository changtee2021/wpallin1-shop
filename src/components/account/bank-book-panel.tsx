import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchCustomerDocuments,
  saveCustomerDocumentFn,
  submitBankAccountFn,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import {
  docTypeLabel,
  type CustomerDocumentDto,
} from "@/services/documents.service";
import type { BankAccountRequestDto } from "@/types/api/profile";

type BankBookPanelProps = {
  bankAccount: BankAccountRequestDto | null;
  onSubmitted: () => void;
};

export function BankBookPanel({
  bankAccount,
  onSubmitted,
}: BankBookPanelProps) {
  const { session } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [bankName, setBankName] = useState(bankAccount?.bankName ?? "");
  const [accountNumber, setAccountNumber] = useState(
    bankAccount?.accountNumber ?? "",
  );
  const [accountName, setAccountName] = useState(
    bankAccount?.accountName ?? "",
  );
  const [branch, setBranch] = useState(bankAccount?.branch ?? "");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [docs, setDocs] = useState<CustomerDocumentDto[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    setBankName(bankAccount?.bankName ?? "");
    setAccountNumber(bankAccount?.accountNumber ?? "");
    setAccountName(bankAccount?.accountName ?? "");
    setBranch(bankAccount?.branch ?? "");
  }, [bankAccount]);

  async function loadDocs() {
    setLoadingDocs(true);
    try {
      const list = await fetchCustomerDocuments(authServerFnOptions(session));
      setDocs(list.filter((d) => d.docType === "bank_book"));
    } finally {
      setLoadingDocs(false);
    }
  }

  useEffect(() => {
    void loadDocs();
  }, [session]);

  const statusLabel = (s: string) =>
    s === "approved" ? "อนุมัติแล้ว" : s === "rejected" ? "ปฏิเสธ" : "รอตรวจ";

  const bankStatusLabel =
    bankAccount?.status === "approved"
      ? "อนุมัติแล้ว"
      : bankAccount?.status === "rejected"
        ? "ปฏิเสธ"
        : bankAccount?.status === "pending"
          ? "รอแอดมินอนุมัติ"
          : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      toast.error("กรุณากรอกธนาคาร เลขบัญชี และชื่อบัญชี");
      return;
    }
    if (!slipFile && docs.length === 0) {
      toast.error("กรุณาอัปโหลดภาพหน้าสมุดบัญชี");
      return;
    }

    setSubmitting(true);
    try {
      await submitBankAccountFn({
        data: {
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim(),
          branch: branch.trim() || undefined,
        },
        ...authServerFnOptions(session),
      });

      if (slipFile) {
        const form = new FormData();
        form.append("file", slipFile);
        form.append("docType", "bank_book");
        const res = await fetch("/api/v1/customer-document", {
          method: "POST",
          headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
          body: form,
        });
        const json = (await res.json()) as {
          ok?: boolean;
          fileUrl?: string;
          fileName?: string;
          mimeType?: string;
          fileSize?: number;
          error?: string;
        };
        if (!res.ok || !json.fileUrl) {
          throw new Error(json.error ?? "อัปโหลดภาพไม่สำเร็จ");
        }
        await saveCustomerDocumentFn({
          data: {
            docType: "bank_book",
            fileUrl: json.fileUrl,
            fileName: json.fileName,
            mimeType: json.mimeType,
            fileSize: json.fileSize,
          },
          ...authServerFnOptions(session),
        });
      }

      toast.success("ส่งข้อมูลบัญชีแล้ว รอแอดมินอนุมัติ");
      setSlipFile(null);
      await loadDocs();
      onSubmitted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ส่งไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            บัญชีธนาคารสำหรับรับเงินคืน / โอน
            {bankStatusLabel ? (
              <Badge
                variant={
                  bankAccount?.status === "approved"
                    ? "default"
                    : bankAccount?.status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
              >
                {bankStatusLabel}
              </Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:max-w-lg">
            <div className="grid gap-2">
              <Label htmlFor="bank-name">ธนาคาร</Label>
              <Input
                id="bank-name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="เช่น กสิกรไทย"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bank-account">เลขบัญชี</Label>
              <Input
                id="bank-account"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="xxx-x-xxxxx-x"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bank-holder">ชื่อบัญชี</Label>
              <Input
                id="bank-holder"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bank-branch">สาขา (ถ้ามี)</Label>
              <Input
                id="bank-branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bank-book-image">ภาพหน้าสมุดบัญชี</Label>
              <Input
                id="bank-book-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setSlipFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">
                อัปโหลดภาพหน้าแบงค์ ส่งให้แอดมินตรวจสอบและอนุมัติ
              </p>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              ส่งให้แอดมินอนุมัติ
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">เอกสารสมุดบัญชีที่ส่งแล้ว</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadingDocs ? (
            <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
          ) : docs.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีเอกสาร</p>
          ) : (
            docs.map((d) => (
              <div
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{docTypeLabel(d.docType)}</p>
                  <p className="text-muted-foreground">{d.fileName ?? "—"}</p>
                </div>
                <Badge
                  variant={
                    d.status === "approved"
                      ? "default"
                      : d.status === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {statusLabel(d.status)}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
