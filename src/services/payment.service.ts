import type { SupabaseClient } from "@supabase/supabase-js";

const SLIP_BUCKET = "wpall-retail-payment-slips";

export async function uploadPaymentSlip(
  supabase: SupabaseClient,
  userId: string,
  paymentId: string,
  orderId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${orderId}/${paymentId}-${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(SLIP_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadErr) throw new Error(uploadErr.message);

  const storagePath = `storage://${path}`;

  const { error: slipErr } = await supabase.from("payment_slips").insert({
    payment_id: paymentId,
    user_id: userId,
    file_url: storagePath,
  });
  if (slipErr) throw new Error(slipErr.message);

  await supabase
    .from("payments")
    .update({ status: "awaiting_verification" })
    .eq("id", paymentId);

  await supabase
    .from("orders")
    .update({
      status: "awaiting_payment_verification",
      payment_status: "awaiting_verification",
    })
    .eq("id", orderId);

  return storagePath;
}
