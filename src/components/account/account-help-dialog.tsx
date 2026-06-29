import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocaleControl, useT } from "@/i18n";
import {
  ACCOUNT_HELP_TOPICS,
  pickLocalized,
  type HelpTopic,
} from "@/lib/account-help-faq";
import { cn } from "@/lib/utils";

type AccountHelpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function HelpFlowStrip({
  topic,
  locale,
}: {
  topic: HelpTopic;
  locale: "th" | "en";
}) {
  return (
    <div className="relative -mx-1">
      <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
        {topic.flow.map((step, index) => (
          <div
            key={step.step}
            className="flex shrink-0 items-center snap-start"
          >
            <div
              className={cn(
                "flex w-[7.5rem] flex-col items-center rounded-xl border-2 border-border bg-card px-2 py-3 text-center shadow-sm sm:w-28",
              )}
            >
              <span className="text-2xl" aria-hidden>
                {step.emoji}
              </span>
              <span
                className={cn(
                  "mt-1 flex size-6 items-center justify-center rounded-full text-xs font-bold",
                  topic.accentClass,
                )}
              >
                {step.step}
              </span>
              <p className="mt-1.5 text-sm font-semibold leading-tight">
                {pickLocalized(locale, step.title)}
              </p>
              {step.hint ? (
                <p className="mt-0.5 text-xs text-muted-foreground leading-tight">
                  {pickLocalized(locale, step.hint)}
                </p>
              ) : null}
            </div>
            {index < topic.flow.length - 1 ? (
              <ArrowRight
                className="mx-0.5 size-4 shrink-0 text-muted-foreground/60"
                aria-hidden
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function HelpTopicView({
  topic,
  locale,
  onBack,
  onClose,
}: {
  topic: HelpTopic;
  locale: "th" | "en";
  onBack: () => void;
  onClose: () => void;
}) {
  const { t } = useT();
  const Icon = topic.icon;

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 w-full justify-start gap-2 text-base font-medium"
        onClick={onBack}
      >
        <ArrowLeft className="size-5" />
        {t("account.help.back")}
      </Button>

      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border-2 p-4",
          topic.accentClass,
        )}
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-background/80">
          <Icon className="size-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold leading-snug">
            {pickLocalized(locale, topic.title)}
          </h3>
          <p className="text-sm opacity-90">
            {pickLocalized(locale, topic.subtitle)}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-muted-foreground">
          {t("account.help.flowLabel")}
        </p>
        <HelpFlowStrip topic={topic} locale={locale} />
      </div>

      <p className="text-base leading-relaxed">
        {pickLocalized(locale, topic.simpleText)}
      </p>

      {topic.tipBox ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-base leading-relaxed text-amber-950">
          💡 {pickLocalized(locale, topic.tipBox)}
        </div>
      ) : null}

      {topic.miniFaq.length > 0 ? (
        <div>
          <p className="mb-1 text-sm font-semibold text-muted-foreground">
            {t("account.help.moreQuestions")}
          </p>
          <Accordion type="single" collapsible className="w-full">
            {topic.miniFaq.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="py-3 text-base hover:no-underline">
                  {pickLocalized(locale, item.question)}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  {pickLocalized(locale, item.answer)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 pt-1">
        {topic.ctas.map((cta) => (
          <Button
            key={`${cta.to}-${pickLocalized(locale, cta.label)}`}
            variant="default"
            size="lg"
            className="h-12 text-base"
            asChild
            onClick={onClose}
          >
            <Link to={cta.to} search={cta.search}>
              {pickLocalized(locale, cta.label)}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}

function HelpHomeView({
  locale,
  onSelectTopic,
}: {
  locale: "th" | "en";
  onSelectTopic: (id: string) => void;
}) {
  const { t } = useT();

  return (
    <div className="space-y-3">
      <p className="text-base text-muted-foreground">
        {t("account.help.pickTopic")}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ACCOUNT_HELP_TOPICS.map((topic) => {
          const Icon = topic.icon;
          return (
            <button
              key={topic.id}
              type="button"
              className={cn(
                "flex min-h-[5.5rem] items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                topic.accentClass,
              )}
              onClick={() => onSelectTopic(topic.id)}
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-background/80">
                <Icon className="size-7" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold leading-snug">
                  {pickLocalized(locale, topic.title)}
                </p>
                <p className="mt-0.5 text-sm opacity-80">
                  {pickLocalized(locale, topic.subtitle)}
                </p>
              </div>
              <ChevronRight
                className="size-5 shrink-0 opacity-60"
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AccountHelpDialog({
  open,
  onOpenChange,
}: AccountHelpDialogProps) {
  const { t } = useT();
  const { locale } = useLocaleControl();
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  const activeTopic = activeTopicId
    ? ACCOUNT_HELP_TOPICS.find((t) => t.id === activeTopicId)
    : null;

  useEffect(() => {
    if (!open) setActiveTopicId(null);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="shrink-0 space-y-1 border-b px-5 py-4 pr-12 text-left">
          <DialogTitle className="text-xl font-bold">
            {activeTopic
              ? pickLocalized(locale, activeTopic.title)
              : t("account.help.title")}
          </DialogTitle>
          <DialogDescription className="text-base">
            {activeTopic
              ? pickLocalized(locale, activeTopic.subtitle)
              : t("account.help.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {activeTopic ? (
            <HelpTopicView
              topic={activeTopic}
              locale={locale}
              onBack={() => setActiveTopicId(null)}
              onClose={() => onOpenChange(false)}
            />
          ) : (
            <HelpHomeView locale={locale} onSelectTopic={setActiveTopicId} />
          )}
        </div>

        <div className="shrink-0 border-t bg-muted/30 px-5 py-4">
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full text-base font-semibold"
            asChild
            onClick={() => onOpenChange(false)}
          >
            <Link to="/contact">{t("account.help.contactCta")}</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
