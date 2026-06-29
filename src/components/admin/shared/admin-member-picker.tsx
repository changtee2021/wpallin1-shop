import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { fetchAdminMembers } from "@/lib/api.functions";
import type { authServerFnOptions } from "@/lib/server-fn-auth";
import type { AdminMemberDto } from "@/services/tier.service";

type AuthOpts = ReturnType<typeof authServerFnOptions>;

type Props = {
  authOpts: AuthOpts;
  value: string | null;
  label: string | null;
  onChange: (userId: string | null, displayName: string | null) => void;
  placeholder?: string;
};

function memberLabel(member: AdminMemberDto) {
  return member.fullName?.trim() || member.email || member.userId;
}

export function AdminMemberPicker({
  authOpts,
  value,
  label,
  onChange,
  placeholder = "เลือกสมาชิก",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<AdminMemberDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authOpts.headers?.Authorization) return;
    setLoading(true);
    void fetchAdminMembers(authOpts)
      .then(setMembers)
      .finally(() => setLoading(false));
  }, [authOpts]);

  const selected = useMemo(
    () => members.find((member) => member.userId === value) ?? null,
    [members, value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members.slice(0, 50);
    return members
      .filter(
        (member) =>
          memberLabel(member).toLowerCase().includes(q) ||
          (member.email ?? "").toLowerCase().includes(q) ||
          (member.phone ?? "").toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [members, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selected ? memberLabel(selected) : (label ?? placeholder)}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-2"
        align="start"
      >
        <Input
          placeholder="ค้นหาสมาชิก…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mb-2"
        />
        <div className="max-h-56 overflow-y-auto">
          <button
            type="button"
            className="flex w-full rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted"
            onClick={() => {
              onChange(null, null);
              setOpen(false);
            }}
          >
            ไม่เลือกสมาชิก
          </button>
          {loading ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">
              กำลังโหลด…
            </p>
          ) : !filtered.length ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">
              ไม่พบสมาชิก
            </p>
          ) : (
            filtered.map((member) => (
              <button
                key={member.userId}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                  value === member.userId && "bg-muted",
                )}
                onClick={() => {
                  onChange(member.userId, memberLabel(member));
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "size-4 shrink-0",
                    value === member.userId ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="truncate">{memberLabel(member)}</span>
                {member.email ? (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {member.email}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
