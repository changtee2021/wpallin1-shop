import { cn } from "@/lib/utils";

type Step = "account" | "form" | "review";

const steps: { id: Step; label: string }[] = [
  { id: "account", label: "สมัครสมาชิก" },
  { id: "form", label: "กรอกใบสมัคร" },
  { id: "review", label: "รออนุมัติ" },
];

export function DealerRegisterSteps({ current }: { current: Step }) {
  const currentIndex = steps.findIndex((s) => s.id === current);

  return (
    <ol className="mb-8 grid gap-3 sm:grid-cols-3">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li
            key={step.id}
            className={cn(
              "rounded-xl border px-3 py-3 text-center text-xs transition-colors",
              done && "border-primary/30 bg-primary/5 text-primary",
              active &&
                "border-primary bg-primary/10 font-semibold text-primary",
              !done && !active && "bg-muted/30 text-muted-foreground",
            )}
          >
            <span className="block text-[10px] font-bold uppercase tracking-wide opacity-70">
              ขั้นที่ {index + 1}
            </span>
            <span className="mt-0.5 block">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
