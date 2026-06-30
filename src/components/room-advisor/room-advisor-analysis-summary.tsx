import { Badge } from "@/components/ui/badge";
import type { RoomAnalysisDto } from "@/types/api/room-advisor";

type Props = {
  analysis: RoomAnalysisDto;
};

export function RoomAdvisorAnalysisSummary({ analysis }: Props) {
  return (
    <div className="space-y-4">
      <div>
        {analysis.roomType ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {analysis.roomType}
          </p>
        ) : null}
        <h2 className="text-xl font-bold sm:text-2xl">{analysis.lightLevel}</h2>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {analysis.moodTags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
        {analysis.styleTags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="rounded-xl bg-muted/50 p-4 text-sm leading-relaxed text-muted-foreground">
        {analysis.reasoning}
      </div>

      {analysis.constraints.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold">ข้อควรรู้</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {analysis.constraints.map((c) => (
              <li key={c}>• {c}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {analysis.colorSuggestions.length > 0 ? (
        <div className="space-y-1">
          <p className="text-sm font-semibold">โทนสีที่แนะนำ</p>
          <p className="text-sm text-muted-foreground">
            {analysis.colorSuggestions.join(" · ")}
          </p>
        </div>
      ) : null}
    </div>
  );
}
