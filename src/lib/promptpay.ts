/** Build Thai PromptPay EMVCo QR payload (Bill Payment / Credit Transfer). */
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function formatPromptPayId(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `0066${digits.slice(1)}`;
  }
  if (digits.length === 13) {
    return digits;
  }
  throw new Error("PromptPay ID must be 10-digit phone or 13-digit tax ID");
}

export function buildPromptPayPayload(
  promptPayId: string,
  amount?: number,
): string {
  const id = formatPromptPayId(promptPayId);
  const merchantAccount = tlv(
    "29",
    tlv("00", "A000000677010111") + tlv("01", id.length <= 13 ? id : id),
  );

  let payload =
    tlv("00", "01") +
    tlv("01", amount != null && amount > 0 ? "12" : "11") +
    merchantAccount +
    tlv("53", "764");

  if (amount != null && amount > 0) {
    payload += tlv("54", amount.toFixed(2));
  }

  payload += tlv("58", "TH") + "6304";
  return payload + crc16(payload);
}

export function promptPayQrImageUrl(payload: string, size = 220): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(payload)}`;
}
