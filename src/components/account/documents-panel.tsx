import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchCustomerDocuments,
  saveCustomerDocumentFn,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import {
  docTypeLabel,
  requiredDocsForCustomerType,
  type CustomerDocumentDto,
  type KycDocType,
} from "@/services/documents.service";

type DocumentsPanelProps = {
  customerType: "individual" | "juristic";
};

export function DocumentsPanel({ customerType }: DocumentsPanelProps) {
  const { session } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<CustomerDocumentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState<KycDocType>("id_card");

  const required = requiredDocsForCustomerType(customerType);

  async function load() {
    setLoading(true);
    try {
      const list = await fetchCustomerDocuments(authServerFnOptions(session));
      setDocs(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [session]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("docType", docType);
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
        throw new Error(json.error ?? "อัปโหลดไม่สำเร็จ");
      }
      await saveCustomerDocumentFn({
        data: {
          docType,
          fileUrl: json.fileUrl,
          fileName: json.fileName,
          mimeType: json.mimeType,
          fileSize: json.fileSize,
        },
        ...authServerFnOptions(session),
      });
      toast.success("อัปโหลดเอกสารแล้ว รอแอดมินตรวจสอบ");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  }

  const statusLabel = (s: string) =>
    s === "approved" ? "อนุมัติแล้ว" : s === "rejected" ? "ปฏิเสธ" : "รอตรวจ";

  if (loading) return <p className="text-muted-foreground">กำลังโหลด...</p>;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="text-sm text-muted-foreground">
            เอกสารที่ต้องมีสำหรับขอเครดิต:{" "}
            {required.map((d) => docTypeLabel(d)).join(", ")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>ประเภทเอกสาร</Label>
              <Select
                value={docType}
                onValueChange={(v) => setDocType(v as KycDocType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "id_card",
                      "house_registration",
                      "company_certificate",
                      "vat_pp20",
                      "tax_id_card",
                      "bank_book",
                      "other",
                    ] as KycDocType[]
                  ).map((t) => (
                    <SelectItem key={t} value={t}>
                      {docTypeLabel(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUpload(f);
                }}
              />
              <Button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? "กำลังอัปโหลด..." : "อัปโหลดเอกสาร"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีเอกสาร</p>
        ) : (
          docs.map((d) => (
            <Card key={d.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <p className="font-medium">{docTypeLabel(d.docType)}</p>
                  <p className="text-sm text-muted-foreground">
                    {d.fileName ?? "—"}
                  </p>
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
