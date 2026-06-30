import type { SupabaseClient } from "@supabase/supabase-js";

export type KycDocType =
  | "id_card"
  | "house_registration"
  | "company_certificate"
  | "vat_pp20"
  | "tax_id_card"
  | "bank_book"
  | "other";

export type KycDocStatus = "pending" | "approved" | "rejected";

export type CustomerDocumentDto = {
  id: string;
  docType: KycDocType;
  fileUrl: string;
  fileName: string | null;
  mimeType: string | null;
  status: KycDocStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

const INDIVIDUAL_REQUIRED: KycDocType[] = ["id_card"];
const JURISTIC_REQUIRED: KycDocType[] = ["company_certificate", "vat_pp20"];

const INDIVIDUAL_KYC_DOCS: KycDocType[] = [
  "id_card",
  "house_registration",
  "tax_id_card",
];

const JURISTIC_KYC_DOCS: KycDocType[] = [
  "company_certificate",
  "vat_pp20",
  "tax_id_card",
];

export type KycDocRequirement = {
  docType: KycDocType;
  required: boolean;
};

export function kycDocsForCustomerType(
  customerType: "individual" | "juristic",
): KycDocRequirement[] {
  const required = new Set(requiredDocsForCustomerType(customerType));
  const types =
    customerType === "juristic" ? JURISTIC_KYC_DOCS : INDIVIDUAL_KYC_DOCS;
  return types.map((docType) => ({
    docType,
    required: required.has(docType),
  }));
}

export function kycCatalogForDisplay(): {
  individual: KycDocRequirement[];
  juristic: KycDocRequirement[];
} {
  return {
    individual: kycDocsForCustomerType("individual"),
    juristic: kycDocsForCustomerType("juristic"),
  };
}

export function requiredDocsForCustomerType(
  customerType: "individual" | "juristic",
): KycDocType[] {
  return customerType === "juristic" ? JURISTIC_REQUIRED : INDIVIDUAL_REQUIRED;
}

const CUSTOMER_DOCS_BUCKET = "wpall-retail-customer-docs";
const SIGNED_URL_TTL_SEC = 3600;

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

async function resolveCustomerDocFileUrl(
  supabase: SupabaseClient,
  stored: string,
): Promise<string> {
  if (isHttpUrl(stored)) return stored;
  const { data, error } = await supabase.storage
    .from(CUSTOMER_DOCS_BUCKET)
    .createSignedUrl(stored, SIGNED_URL_TTL_SEC);
  if (error || !data?.signedUrl) return stored;
  return data.signedUrl;
}

function mapDoc(row: {
  id: string;
  doc_type: string;
  file_url: string;
  file_name: string | null;
  mime_type: string | null;
  status: string;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}): CustomerDocumentDto {
  return {
    id: row.id,
    docType: row.doc_type as KycDocType,
    fileUrl: row.file_url,
    fileName: row.file_name,
    mimeType: row.mime_type,
    status: row.status as KycDocStatus,
    reviewNote: row.review_note,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
  };
}

async function mapDocWithSignedUrl(
  supabase: SupabaseClient,
  row: Parameters<typeof mapDoc>[0],
): Promise<CustomerDocumentDto> {
  const doc = mapDoc(row);
  return {
    ...doc,
    fileUrl: await resolveCustomerDocFileUrl(supabase, doc.fileUrl),
  };
}

export async function listCustomerDocuments(
  supabase: SupabaseClient,
  userId: string,
): Promise<CustomerDocumentDto[]> {
  const { data, error } = await supabase
    .from("customer_documents")
    .select(
      "id, doc_type, file_url, file_name, mime_type, status, review_note, reviewed_at, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return Promise.all((data ?? []).map((row) => mapDocWithSignedUrl(supabase, row)));
}

export async function saveCustomerDocument(
  supabase: SupabaseClient,
  userId: string,
  input: {
    docType: KycDocType;
    fileUrl: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
  },
): Promise<CustomerDocumentDto> {
  const { data, error } = await supabase
    .from("customer_documents")
    .insert({
      user_id: userId,
      doc_type: input.docType,
      file_url: input.fileUrl,
      file_name: input.fileName ?? null,
      mime_type: input.mimeType ?? null,
      file_size: input.fileSize ?? null,
      status: "pending",
    })
    .select(
      "id, doc_type, file_url, file_name, mime_type, status, review_note, reviewed_at, created_at",
    )
    .single();

  if (error) throw new Error(error.message);
  return mapDocWithSignedUrl(supabase, data);
}

export async function reviewCustomerDocument(
  supabase: SupabaseClient,
  docId: string,
  reviewerId: string,
  status: "approved" | "rejected",
  reviewNote?: string,
): Promise<void> {
  const { error } = await supabase
    .from("customer_documents")
    .update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      review_note: reviewNote?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", docId);

  if (error) throw new Error(error.message);
}

export async function hasApprovedKyc(
  supabase: SupabaseClient,
  userId: string,
  customerType: "individual" | "juristic",
): Promise<boolean> {
  const required = requiredDocsForCustomerType(customerType);
  const docs = await listCustomerDocuments(supabase, userId);
  return required.every((docType) =>
    docs.some((d) => d.docType === docType && d.status === "approved"),
  );
}

export function docTypeLabel(docType: KycDocType): string {
  const map: Record<KycDocType, string> = {
    id_card: "บัตรประชาชน",
    house_registration: "ทะเบียนบ้าน",
    company_certificate: "หนังสือรับรองบริษัท",
    vat_pp20: "ภพ.20",
    tax_id_card: "บัตรประจำตัวผู้เสียภาษี",
    bank_book: "สมุดบัญชีธนาคาร",
    other: "เอกสารอื่นๆ",
  };
  return map[docType] ?? docType;
}
