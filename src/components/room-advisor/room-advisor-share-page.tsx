import { Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ContactSalesButton } from "@/components/storefront/contact-sales-button";
import { RecommendedStyleCard } from "@/components/room-advisor/recommended-style-card";
import { RoomAdvisorAnalysisSummary } from "@/components/room-advisor/room-advisor-analysis-summary";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitRoomAdvisorResponseFn } from "@/lib/server-fns/room-advisor";
import type { RoomAdvisorSessionDto } from "@/types/api/room-advisor";

type Props = {
  session: RoomAdvisorSessionDto;
  token: string;
};

export function RoomAdvisorSharePage({ session, token }: Props) {
  const [selectedRanks, setSelectedRanks] = useState<number[]>(
    session.customerSelectedRanks ?? [],
  );
  const [feedback, setFeedback] = useState(session.customerFeedback ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(
    session.status === "customer_responded",
  );

  const hero = session.photos.find((p) => p.isHero) ?? session.photos[0];

  const toggleRank = (rank: number) => {
    setSelectedRanks((prev) =>
      prev.includes(rank) ? prev.filter((r) => r !== rank) : [...prev, rank],
    );
  };

  const handleSubmit = async () => {
    if (selectedRanks.length === 0) {
      toast.error("กรุณาเลือกอย่างน้อย 1 แบบ");
      return;
    }
    setSubmitting(true);
    try {
      await submitRoomAdvisorResponseFn({
        data: { token, selectedRanks, feedback: feedback || null },
      });
      setSubmitted(true);
      toast.success("ส่งแบบที่เลือกแล้ว — เจ้าหน้าที่จะติดต่อกลับ");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ส่งไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
      <header className="space-y-1 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          WP ALL · Room Advisor
        </p>
        <h1 className="text-2xl font-bold">แบบม่านสำหรับคุณ</h1>
        {session.clientName ? (
          <p className="text-sm text-muted-foreground">
            สวัสดีคุณ{session.clientName}
          </p>
        ) : null}
        {session.shareExpiresAt ? (
          <p className="text-xs text-muted-foreground">
            ลิงก์หมดอายุ{" "}
            {new Date(session.shareExpiresAt).toLocaleString("th-TH")}
          </p>
        ) : null}
      </header>

      {hero ? (
        <div className="overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-black/5">
          <img
            src={hero.publicUrl}
            alt="รูปห้อง"
            className="max-h-[50vh] w-full object-cover"
          />
        </div>
      ) : null}

      {session.analysis ? (
        <RoomAdvisorAnalysisSummary analysis={session.analysis} />
      ) : null}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">เลือกแบบที่ชอบ</h2>
        {session.recommendations.map((rec) => (
          <RecommendedStyleCard
            key={rec.rank}
            recommendation={rec}
            selectable={!submitted}
            selected={selectedRanks.includes(rec.rank)}
            onToggleSelect={() => toggleRank(rec.rank)}
          />
        ))}
      </div>

      {!submitted ? (
        <div className="space-y-3">
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="ความคิดเห็นเพิ่มเติม (ถ้ามี)"
            rows={3}
          />
          <Button
            className="w-full bg-accent hover:bg-accent/90"
            disabled={submitting}
            onClick={() => void handleSubmit()}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            ส่งแบบที่เลือก
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
          <CheckCircle2 className="size-10 text-primary" />
          <p className="font-semibold">ส่งแล้ว! เจ้าหน้าที่จะติดต่อกลับเร็วๆ นี้</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/configurator">ปรับเองใน Custom</Link>
            </Button>
            <ContactSalesButton variant="default" />
          </div>
        </div>
      )}
    </div>
  );
}
