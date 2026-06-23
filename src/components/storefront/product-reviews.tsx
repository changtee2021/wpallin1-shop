import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchProductReviews,
  submitProductReviewFn,
} from "@/lib/api.functions";
import { formatDate } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";

export function ProductReviews({
  productId,
}: {
  productId: string;
}) {
  const { session } = useAuth();
  const [reviews, setReviews] = useState<
    Awaited<ReturnType<typeof fetchProductReviews>>["reviews"]
  >([]);
  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function reload() {
    const data = await fetchProductReviews({ data: { productId } });
    setReviews(data.reviews);
    setSummary(data.summary);
  }

  useEffect(() => {
    void reload();
  }, [productId]);

  async function handleSubmit() {
    if (!session) {
      toast.error("กรุณาเข้าสู่ระบบก่อนรีวิว");
      return;
    }
    setSubmitting(true);
    try {
      await submitProductReviewFn({
        data: { productId, rating, title: title || undefined, body },
        ...authServerFnOptions(session),
      });
      toast.success("ส่งรีวิวแล้ว");
      setTitle("");
      setBody("");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">รีวิว</h2>
        {summary.count > 0 && (
          <Badge variant="secondary">
            {summary.average} / 5 ({summary.count})
          </Badge>
        )}
      </div>

      {session && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div>
              <Label>คะแนน</Label>
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className="p-1"
                  >
                    <Star
                      className={`size-5 ${n <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>หัวข้อ (ไม่บังคับ)</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>ความคิดเห็น</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
            <Button disabled={submitting} onClick={() => void handleSubmit()}>
              ส่งรีวิว
            </Button>
          </CardContent>
        </Card>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">ยังไม่มีรีวิว</p>
      ) : (
        reviews.map((r) => (
          <Card key={r.id}>
            <CardContent className="space-y-1 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{r.authorName ?? "สมาชิก"}</p>
                <span className="text-sm">{r.rating}/5</span>
              </div>
              {r.title && <p className="text-sm font-semibold">{r.title}</p>}
              <p className="text-sm">{r.body}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(r.createdAt)}
                {r.isVerifiedPurchase ? " · ซื้อแล้ว" : ""}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
