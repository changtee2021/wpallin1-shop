const LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push";
const LINE_TEXT_LIMIT = 4900;

function getLineStaffConfig(): { token: string; to: string } | null {
  if (process.env.INTEGRATIONS_ENABLED === "false") return null;
  const token = process.env.LINE_STAFF_CHANNEL_ACCESS_TOKEN?.trim();
  const to = process.env.LINE_STAFF_TARGET_ID?.trim();
  if (!token || !to) return null;
  return { token, to };
}

/**
 * Pushes a plain-text alert to the sales LINE group/user. Skips quietly when the
 * channel is not configured so a missing token never blocks a customer's request.
 */
export async function pushLineStaffMessage(text: string): Promise<boolean> {
  const config = getLineStaffConfig();
  if (!config) return false;

  try {
    const response = await fetch(LINE_PUSH_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: config.to,
        messages: [{ type: "text", text: text.slice(0, LINE_TEXT_LIMIT) }],
      }),
    });
    if (!response.ok) {
      console.error(
        "[line] push failed",
        response.status,
        await response.text().catch(() => ""),
      );
    }
    return response.ok;
  } catch (err) {
    console.error("[line] push error", err);
    return false;
  }
}
