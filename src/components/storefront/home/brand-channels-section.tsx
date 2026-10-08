import { Monitor, Plus, Search, ShoppingCart, Smartphone } from "lucide-react";

import { useBi, type Bi } from "@/lib/bi";
import { cn } from "@/lib/utils";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

const CHANNELS: { icon: typeof Monitor; title: Bi; text: Bi }[] = [
  {
    icon: Monitor,
    title: { th: "Website", en: "Website" },
    text: {
      th: "เลือกสินค้า ใส่ขนาด แล้วกดสั่งได้จากจอคอม",
      en: "Pick a product, enter the size and order from your computer",
    },
  },
  {
    icon: Smartphone,
    title: { th: "Mobile Application", en: "Mobile Application" },
    text: {
      th: "สั่งซ้ำและติดตามออเดอร์ได้ทุกที่",
      en: "Reorder and follow an order wherever you are",
    },
  },
];

type MockProduct = { src: string; name: Bi; size: string };

const PRODUCTS: MockProduct[] = [
  {
    src: "/products/wood-blinds.webp",
    name: { th: "มู่ลี่ไม้", en: "Wood blinds" },
    size: "120 × 180",
  },
  {
    src: "/products/roller-blinds.webp",
    name: { th: "ม่านม้วน", en: "Roller blinds" },
    size: "150 × 200",
  },
  {
    src: "/products/aluminium-blinds.webp",
    name: { th: "มู่ลี่อลูมิเนียม", en: "Aluminium" },
    size: "90 × 160",
  },
  {
    src: "/products/vertical-blinds.webp",
    name: { th: "ม่านปรับแสง", en: "Vertical blinds" },
    size: "200 × 220",
  },
  {
    src: "/products/zip-blinds.webp",
    name: { th: "ม่านซิป", en: "Zip blinds" },
    size: "250 × 240",
  },
  {
    src: "/products/motorized-track.webp",
    name: { th: "รางมอเตอร์", en: "Motor track" },
    size: "300 cm",
  },
  {
    src: "/products/pvc-folding-door.webp",
    name: { th: "ฉากกั้นห้อง PVC", en: "PVC partition" },
    size: "180 × 220",
  },
  {
    src: "/products/curtain-rod.webp",
    name: { th: "ราวม่าน", en: "Curtain rod" },
    size: "200 cm",
  },
  {
    src: "/products/standard-track.webp",
    name: { th: "รางม่าน", en: "Curtain track" },
    size: "250 cm",
  },
];

const CATEGORIES: Bi[] = [
  { th: "ทั้งหมด", en: "All" },
  { th: "มู่ลี่", en: "Blinds" },
  { th: "ม่านม้วน", en: "Rollers" },
  { th: "ราง", en: "Tracks" },
  { th: "มอเตอร์", en: "Motors" },
];

type Pick = (value: Bi) => string;

/**
 * Closing homepage chapter: the ordering website and phone app, still marked Soon.
 * The devices are decorative — the heading and the two lines carry the meaning.
 * Motion is CSS scroll-driven (`channel-*` in styles.css), so it costs no JS.
 */
export function BrandChannels() {
  const pick = useBi();

  return (
    <section className="channels-timeline brand-section overflow-hidden border-t border-border bg-background">
      <div className={container}>
        {/* Same columns and gap as BrandChooseGuide, so the step-05 line lands on the monitor. */}
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
          <div className="max-w-xl">
            <p className="scroll-rise brand-kicker flex items-center gap-3 text-primary">
              <span className="inline-flex h-7 items-center rounded-full bg-accent px-3 text-[0.6875rem] tracking-[0.16em] text-white">
                Soon
              </span>
              <span aria-hidden className="h-px w-8 bg-border" />
              How to order
            </p>
            <h2 className="scroll-rise brand-heading mt-4 text-foreground">
              Order online, on web and app
            </h2>
            <p className="scroll-rise mt-4 max-w-lg text-base leading-7 text-pretty text-muted-foreground">
              {pick({
                th: "ร้านค้าและตัวแทนจะสั่งสินค้า WP ALL ได้เองตลอดเวลา ระบบกำลังจะเปิดให้ใช้",
                en: "Shops and dealers will be able to order WP ALL products any time. Opening soon.",
              })}
            </p>

            <ul className="mt-8 space-y-5">
              {CHANNELS.map((channel, index) => {
                const Icon = channel.icon;
                return (
                  <li
                    key={channel.title.en}
                    className="scroll-rise flex gap-4"
                    style={{ ["--i" as string]: index + 1 }}
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-base font-medium text-foreground">
                        {pick(channel.title)}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                        {pick(channel.text)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div
            aria-hidden
            className="relative mx-auto w-full max-w-2xl select-none pb-4 lg:mx-0 lg:mt-10"
          >
            <span className="channel-link-track absolute bottom-full left-[1.625rem] z-20 hidden h-[calc(clamp(4rem,9vw,7.5rem)+2.5rem)] w-px bg-border lg:block">
              <span className="channel-link-to block size-full origin-top bg-accent" />
            </span>
            <span className="channel-link-node absolute top-0 left-[1.625rem] z-20 hidden size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-4 ring-accent/25 lg:block" />
            <div className="channel-monitor-in mr-[16%] sm:mr-[18%]">
              <MonitorFrame pick={pick} />
            </div>
            <div className="channel-phone-in absolute top-[12%] right-0 z-10 w-[36%] min-w-[7.5rem] sm:w-[31%]">
              <PhoneFrame pick={pick} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SoonPill() {
  return (
    <span className="rounded-full bg-accent px-1.5 py-0.5 text-[7px] font-medium tracking-wide text-white uppercase sm:text-[8px]">
      Soon
    </span>
  );
}

function CartIcon({ count }: { count: number }) {
  return (
    <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
      <ShoppingCart className="size-3" />
      <span className="channel-pop absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-accent text-[7px] font-medium text-white">
        {count}
      </span>
    </span>
  );
}

function AddButton({ label, added }: { label: string; added?: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 items-center justify-center gap-0.5 rounded-full px-1.5 text-[7px] font-medium sm:h-5 sm:text-[8px]",
        added ? "channel-added bg-accent text-white" : "bg-primary text-white",
      )}
    >
      <Plus className="size-2" />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

function MonitorFrame({ pick }: { pick: Pick }) {
  return (
    <div>
      <div className="rounded-[1.15rem] bg-primary-deep p-1.5 shadow-[0_30px_60px_-28px_rgb(0_0_0/0.55)] ring-1 ring-black/15 sm:p-2">
        <div className="overflow-hidden rounded-[0.7rem] bg-white">
          <div className="flex h-6 items-center gap-1.5 bg-surface px-2.5 sm:h-7">
            <span className="size-1.5 rounded-full bg-[#e8a0a0]" />
            <span className="size-1.5 rounded-full bg-[#e6c27a]" />
            <span className="size-1.5 rounded-full bg-[#8fbf9a]" />
            <span className="ml-1 flex h-4 min-w-0 flex-1 items-center rounded-full bg-white px-2 text-[8px] text-muted-foreground sm:text-[9px]">
              shop.wpallin1.com
            </span>
            <SoonPill />
          </div>

          <div className="flex items-center gap-2 border-b border-border px-2.5 py-1.5">
            <img
              src="/brand/logo-color.png"
              alt=""
              className="h-3.5 w-auto shrink-0"
            />
            <span className="flex h-5 min-w-0 flex-1 items-center gap-1 rounded-full bg-surface px-2 text-[8px] text-muted-foreground">
              <Search className="size-2.5 shrink-0" />
              <span className="truncate">
                {pick({
                  th: "ค้นหาสินค้า หรือรหัส",
                  en: "Search products or codes",
                })}
              </span>
            </span>
            <CartIcon count={3} />
          </div>

          <div className="flex aspect-[16/9] min-h-0">
            <ul className="hidden w-[22%] shrink-0 space-y-1 border-r border-border p-2 text-[8px] text-muted-foreground sm:block">
              {CATEGORIES.map((category, index) => (
                <li
                  key={category.en}
                  className={cn(
                    "truncate rounded px-1.5 py-1",
                    index === 1 && "bg-primary-soft font-medium text-primary",
                  )}
                >
                  {pick(category)}
                </li>
              ))}
            </ul>

            <div className="relative min-w-0 flex-1 overflow-hidden">
              <div className="channel-screen-scroll p-2">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[9px] font-medium text-foreground sm:text-[10px]">
                    {pick({ th: "สั่งสินค้า", en: "Order products" })}
                  </p>
                  <p className="text-[7px] text-muted-foreground sm:text-[8px]">
                    {pick({
                      th: `${PRODUCTS.length} รายการ`,
                      en: `${PRODUCTS.length} items`,
                    })}
                  </p>
                </div>
                <ul className="grid grid-cols-3 gap-1.5">
                  {PRODUCTS.map((product, index) => (
                    <li
                      key={product.src}
                      className="min-w-0 rounded-md border border-border p-1"
                    >
                      <img
                        src={product.src}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="aspect-[4/3] w-full rounded-sm object-cover"
                      />
                      <p className="mt-1 truncate text-[8px] font-medium text-foreground sm:text-[9px]">
                        {pick(product.name)}
                      </p>
                      <div className="mt-0.5 flex items-center justify-between gap-1">
                        <span className="truncate text-[7px] text-muted-foreground">
                          {product.size}
                        </span>
                        <AddButton
                          label={pick({ th: "ตะกร้า", en: "Add" })}
                          added={index === 1}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white to-transparent" />
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto h-3 w-12 bg-primary-deep sm:h-4 sm:w-16" />
      <div className="mx-auto h-1.5 w-24 rounded-full bg-primary-deep sm:w-32" />
    </div>
  );
}

function PhoneFrame({ pick }: { pick: Pick }) {
  return (
    <div className="relative rounded-[1.4rem] bg-primary-deep p-1.5 shadow-[0_24px_44px_-18px_rgb(0_0_0/0.6)] ring-1 ring-black/20">
      <span className="absolute top-[18%] -left-1 h-7 w-0.5 rounded-l bg-primary-deep" />
      <span className="absolute top-[28%] -right-1 h-10 w-0.5 rounded-r bg-primary-deep" />
      <div className="relative flex aspect-[9/17] flex-col overflow-hidden rounded-[1.1rem] bg-white">
        <div className="flex justify-center pt-1.5">
          <span className="h-3 w-10 rounded-full bg-primary-deep" />
        </div>
        <div className="flex items-center justify-between gap-1 px-2 pt-1.5 pb-1">
          <p className="text-[10px] font-medium text-foreground sm:text-[11px]">
            {pick({ th: "สั่งของ", en: "Order" })}
          </p>
          <CartIcon count={3} />
        </div>
        <div className="mx-2 flex h-5 items-center gap-1 rounded-full bg-surface px-2 text-[7px] text-muted-foreground">
          <Search className="size-2.5" />
          {pick({ th: "ค้นหา", en: "Search" })}
        </div>
        <div className="flex gap-1 overflow-hidden px-2 py-1.5">
          {CATEGORIES.slice(0, 4).map((category, index) => (
            <span
              key={category.en}
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 text-[7px]",
                index === 0
                  ? "bg-primary text-white"
                  : "bg-surface text-muted-foreground",
              )}
            >
              {pick(category)}
            </span>
          ))}
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <ul className="channel-screen-scroll space-y-1.5 px-2 pb-2">
            {PRODUCTS.map((product, index) => (
              <li key={product.src} className="flex items-center gap-1.5">
                <img
                  src={product.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-7 shrink-0 rounded-sm object-cover sm:size-8"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[8px] font-medium text-foreground sm:text-[9px]">
                    {pick(product.name)}
                  </span>
                  <span className="block text-[7px] text-muted-foreground">
                    {product.size}
                  </span>
                </span>
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full text-white sm:size-5",
                    index === 2 ? "channel-added bg-accent" : "bg-primary",
                  )}
                >
                  <Plus className="size-2.5" />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="channel-cart-bar mx-1.5 mb-1.5 flex items-center justify-between gap-1 rounded-full bg-primary-deep px-2 py-1 text-white">
          <span className="text-[7px] sm:text-[8px]">
            {pick({ th: "ตะกร้า 3 รายการ", en: "Cart · 3 items" })}
          </span>
          <span className="flex items-center gap-1">
            <SoonPill />
          </span>
        </div>
      </div>
    </div>
  );
}
