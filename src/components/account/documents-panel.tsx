import { CheckCircle2, Circle, Loader2, Upload } from "lucide-react";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchCustomerDocuments,
  saveCustomerDocumentFn,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { cn } from "@/lib/utils";
import {
  docTypeLabel,
  kycCatalogForDisplay,
  type CustomerDocumentDto,
  type KycDocRequirement,
  type KycDocType,
} from "@/services/documents.service";

type DocumentsPanelProps = {
  customerType: "individual" | "juristic";
};

export function DocumentsPanel({ customerType }: DocumentsPanelProps) {
  const { session } = useAuth();
  const [docs, setDocs] = useState<CustomerDocumentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<KycDocType | null>(null);
  const fileRefs = useRef<Partial<Record<KycDocType, HTMLInputElement>>>({});

  const catalog = kycCatalogForDisplay();

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

  function latestDoc(docType: KycDocType): CustomerDocumentDto | undefined {
    return docs.find((d) => d.docType === docType);
  }

  async function handleUpload(docType: KycDocType, file: File) {
    setUploadingType(docType);
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
      setUploadingType(null);
    }
  }

  const statusLabel = (s: string) =>
    s === "approved" ? "อนุมัติแล้ว" : s === "rejected" ? "ปฏิเสธ" : "รอตรวจ";

  if (loading) {
    return <p className="text-muted-foreground">กำลังโหลดเอกสาร...</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        อัปโหลดเอกสารยืนยันตัวตนตามประเภทผู้ซื้อของคุณ (
        {customerType === "juristic" ? "นิติบุคคล" : "บุคคลธรรมดา"}) —
        เปลี่ยนประเภทได้ที่หน้าข้อมูลส่วนตัว ·
        สมุดบัญชีธนาคารอัปโหลดที่แท็บการเงิน
      </p>

      <KycTypeSection
        title="บุคคลธรรมดา"
        description="เอกสารสำหรับลูกค้าบุคคลธรรมดา"
        requirements={catalog.individual}
        active={customerType === "individual"}
        docs={docs}
        uploadingType={uploadingType}
        fileRefs={fileRefs}
        latestDoc={latestDoc}
        statusLabel={statusLabel}
        onUpload={handleUpload}
      />

      <KycTypeSection
        title="นิติบุคคล"
        description="เอกสารสำหรับบริษัท / นิติบุคคล"
        requirements={catalog.juristic}
        active={customerType === "juristic"}
        docs={docs}
        uploadingType={uploadingType}
        fileRefs={fileRefs}
        latestDoc={latestDoc}
        statusLabel={statusLabel}
        onUpload={handleUpload}
      />
    </div>
  );
}

function KycTypeSection({
  title,
  description,
  requirements,
  active,
  docs,
  uploadingType,
  fileRefs,
  latestDoc,
  statusLabel,
  onUpload,
}: {
  title: string;
  description: string;
  requirements: KycDocRequirement[];
  active: boolean;
  docs: CustomerDocumentDto[];
  uploadingType: KycDocType | null;
  fileRefs: MutableRefObject<Partial<Record<KycDocType, HTMLInputElement>>>;
  latestDoc: (docType: KycDocType) => CustomerDocumentDto | undefined;
  statusLabel: (s: string) => string;
  onUpload: (docType: KycDocType, file: File) => void;
}) {
  const typeDocs = docs.filter((d) =>
    requirements.some((r) => r.docType === d.docType),
  );

  return (
    <Card
      className={cn(
        !active && "opacity-75",
        active && "ring-1 ring-primary/20",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {active ? (
            <Badge>ประเภทของคุณ</Badge>
          ) : (
            <Badge variant="outline">อ้างอิง</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            เอกสารที่ต้องมี
          </p>
          <ul className="space-y-1.5 text-sm">
            {requirements.map(({ docType, required }) => {
              const uploaded = latestDoc(docType);
              const done = uploaded?.status === "approved";
              return (
                <li key={docType} className="flex items-start gap-2">
                  {done ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                  ) : (
                    <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span>
                    {docTypeLabel(docType)}
                    {required ? (
                      <span className="ml-1 text-destructive">*</span>
                    ) : (
                      <span className="ml-1 text-muted-foreground">
                        (แนะนำ)
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            <span className="text-destructive">*</span> จำเป็นสำหรับขอเครดิต /
            ยืนยันตัวตน
          </p>
        </div>

        {active ? (
          <div className="space-y-2">
            {requirements.map(({ docType, required }) => {
              const uploaded = latestDoc(docType);
              const isUploading = uploadingType === docType;
              return (
                <div
                  key={docType}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm">
                      {docTypeLabel(docType)}
                      {required ? (
                        <span className="ml-1 text-destructive">*</span>
                      ) : null}
                    </p>
                    {uploaded ? (
                      <>
                        <p className="truncate text-xs text-muted-foreground">
                          {uploaded.fileName ?? "—"}
                        </p>
                        <Badge
                          className="mt-1"
                          variant={
                            uploaded.status === "approved"
                              ? "default"
                              : uploaded.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {statusLabel(uploaded.status)}
                        </Badge>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        ยังไม่ได้อัปโหลด
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      ref={(el) => {
                        if (el) fileRefs.current[docType] = el;
                      }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void onUpload(docType, file);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant={uploaded ? "outline" : "default"}
                      disabled={isUploading}
                      onClick={() => fileRefs.current[docType]?.click()}
                    >
                      {isUploading ? (
                        <Loader2 className="mr-1.5 size-4 animate-spin" />
                      ) : (
                        <Upload className="mr-1.5 size-4" />
                      )}
                      {uploaded ? "อัปโหลดใหม่" : "อัปโหลด"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            เปลี่ยนประเภทผู้ซื้อเป็น{title} ในหน้าข้อมูลส่วนตัว
            จึงจะอัปโหลดเอกสารชุดนี้ได้
          </p>
        )}

        {active && typeDocs.length > 0 ? (
          <div className="border-t pt-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              ประวัติการส่ง ({typeDocs.length})
            </p>
            <div className="space-y-1.5">
              {typeDocs.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2 text-sm"
                >
                  <span>
                    {docTypeLabel(d.docType)} · {d.fileName ?? "—"}
                  </span>
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
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
