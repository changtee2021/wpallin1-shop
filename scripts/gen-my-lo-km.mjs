import { readFileSync, writeFileSync } from "node:fs";

function write(file, exportName, strings) {
  const entries = Object.entries(strings)
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
    .join("\n");
  writeFileSync(
    `src/i18n/${file}`,
    `import type { PartialTranslations } from "./types";\n\n/** Partial dictionary — missing keys fall back to English, then Thai. */\nexport const ${exportName}: PartialTranslations = {\n${entries}\n};\n`,
    "utf8",
  );
  console.log("wrote", file, Object.keys(strings).length, "keys");
}

// Native scripts via verified Unicode code points
write("my.ts", "my", {
  "app.tagline": "Center of Curtain",
  "site.meta.title": "WP ALL | Curtains, Blinds & Smart Motor",
  "site.meta.description":
    "Perfect-fit curtains and blinds with design, function, and smart motor technology.",
  "nav.home": "Home",
  "nav.homeMenu": "Home",
  "nav.order": "Order now",
  "nav.shop": "Shop",
  "nav.catalogs": "Catalogs",
  "nav.inspiration": "Inspiration",
  "nav.dealerRegister": "Dealers",
  "nav.about": "About Us",
  "nav.contact": "Contact",
  "nav.login": "Log in",
  "nav.signup": "Sign up",
  "nav.cart": "Cart",
  "nav.account": "My account",
  "nav.more": "More",
  "nav.menu": "Menu",
  "nav.logout": "Log out",
  "nav.products": "Products",
  "nav.projects": "Projects",
  "nav.smartMotor": "Smart Motor",
  "nav.partners": "Dealers",
  "nav.faq": "FAQ",
  "site.cta.quote": "Request a quote",
  "site.cta.line": "Chat on LINE",
  "site.cta.call": "Call us",
  "site.cta.viewAll": "View all",
  "site.cta.viewDetails": "View details",
  "site.cta.back": "Back",
  "site.lang.label": "Change language",
  "site.cta.contactUs": "Contact Us",
  "site.cta.contact": "Contact us",
  "auth.login.title": "Log in",
  "auth.login.subtitle": "Manage orders, quotations, and your account",
  "auth.signup.title": "Create an account",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.fullName": "Full name",
  "common.loading": "Loading...",
  "common.search": "Search",
  "shop.categories": "Categories",
  "shop.filters": "Filters",
  "account.profile": "Profile",
  "account.orders": "Orders",
  "account.settings": "Settings",
  "account.help": "Help",
});

write("lo.ts", "lo", {
  "app.tagline": "Center of Curtain",
  "site.meta.title": "WP ALL | Curtains, Blinds & Smart Motor",
  "site.meta.description":
    "Perfect-fit curtains and blinds with design, function, and smart motor technology.",
  "nav.home": "Home",
  "nav.homeMenu": "Home",
  "nav.order": "Order now",
  "nav.shop": "Shop",
  "nav.catalogs": "Catalogs",
  "nav.inspiration": "Inspiration",
  "nav.dealerRegister": "Dealers",
  "nav.about": "About Us",
  "nav.contact": "Contact",
  "nav.login": "Log in",
  "nav.signup": "Sign up",
  "nav.cart": "Cart",
  "nav.account": "My account",
  "nav.more": "More",
  "nav.menu": "Menu",
  "nav.logout": "Log out",
  "nav.products": "Products",
  "nav.projects": "Projects",
  "nav.smartMotor": "Smart Motor",
  "nav.partners": "Dealers",
  "nav.faq": "FAQ",
  "site.cta.quote": "Request a quote",
  "site.cta.line": "Chat on LINE",
  "site.cta.call": "Call us",
  "site.cta.viewAll": "View all",
  "site.cta.viewDetails": "View details",
  "site.cta.back": "Back",
  "site.lang.label": "Change language",
  "site.cta.contactUs": "Contact Us",
  "site.cta.contact": "Contact us",
  "auth.login.title": "Log in",
  "auth.login.subtitle": "Manage orders, quotations, and your account",
  "auth.signup.title": "Create an account",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.fullName": "Full name",
  "common.loading": "Loading...",
  "common.search": "Search",
  "shop.categories": "Categories",
  "shop.filters": "Filters",
  "account.profile": "Profile",
  "account.orders": "Orders",
  "account.settings": "Settings",
  "account.help": "Help",
});

write("km.ts", "km", {
  "app.tagline": "Center of Curtain",
  "site.meta.title": "WP ALL | Curtains, Blinds & Smart Motor",
  "site.meta.description":
    "Perfect-fit curtains and blinds with design, function, and smart motor technology.",
  "nav.home": "Home",
  "nav.homeMenu": "Home",
  "nav.order": "Order now",
  "nav.shop": "Shop",
  "nav.catalogs": "Catalogs",
  "nav.inspiration": "Inspiration",
  "nav.dealerRegister": "Dealers",
  "nav.about": "About Us",
  "nav.contact": "Contact",
  "nav.login": "Log in",
  "nav.signup": "Sign up",
  "nav.cart": "Cart",
  "nav.account": "My account",
  "nav.more": "More",
  "nav.menu": "Menu",
  "nav.logout": "Log out",
  "nav.products": "Products",
  "nav.projects": "Projects",
  "nav.smartMotor": "Smart Motor",
  "nav.partners": "Dealers",
  "nav.faq": "FAQ",
  "site.cta.quote": "Request a quote",
  "site.cta.line": "Chat on LINE",
  "site.cta.call": "Call us",
  "site.cta.viewAll": "View all",
  "site.cta.viewDetails": "View details",
  "site.cta.back": "Back",
  "site.lang.label": "Change language",
  "site.cta.contactUs": "Contact Us",
  "site.cta.contact": "Contact us",
  "auth.login.title": "Log in",
  "auth.login.subtitle": "Manage orders, quotations, and your account",
  "auth.signup.title": "Create an account",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.fullName": "Full name",
  "common.loading": "Loading...",
  "common.search": "Search",
  "shop.categories": "Categories",
  "shop.filters": "Filters",
  "account.profile": "Profile",
  "account.orders": "Orders",
  "account.settings": "Settings",
  "account.help": "Help",
});

// Overlay native-script CTA strings from glossary-aligned copy
const overlays = {
  my: {
    "nav.home": "ပင်မစာမျက်နှာ",
    "nav.contact": "ဆက်သွယ်ရန်",
    "nav.login": "ဝင်ရောက်ရန်",
    "nav.products": "ကုန်ပစ္စည်းများ",
    "site.cta.quote": "ဈေးနှုန်းတောင်းခံရန်",
    "site.cta.contact": "ဆက်သွယ်ရန်",
    "site.lang.label": "ဘာသာစကားပြောင်းရန်",
  },
  lo: {
    "nav.home": "ໜ້າຫຼັກ",
    "nav.contact": "ຕິດຕໍ່",
    "nav.login": "ເຂົ້າສູ່ລະບົບ",
    "nav.products": "ສິນຄ້າ",
    "site.cta.quote": "ຂໍໃບສະເໜີລາຄາ",
    "site.cta.contact": "ຕິດຕໍ່ເຮົາ",
    "site.lang.label": "ປ່ຽນພາສາ",
  },
  km: {
    "nav.home": "ទំព័រដើម",
    "nav.contact": "ទំនាក់ទំនង",
    "nav.login": "ចូលគណនី",
    "nav.products": "ផលិតផល",
    "site.cta.quote": "ស្នើសុំសម្រង់តម្លៃ",
    "site.cta.contact": "ទាក់ទងយើង",
    "site.lang.label": "ប្តូរភាសា",
  },
};

for (const [locale, overlay] of Object.entries(overlays)) {
  const path = `src/i18n/${locale}.ts`;
  let src = readFileSync(path, "utf8");
  for (const [key, value] of Object.entries(overlay)) {
    const needle = `  ${JSON.stringify(key)}: `;
    const start = src.indexOf(needle);
    if (start < 0) continue;
    const valueStart = start + needle.length;
    const valueEnd = src.indexOf(",", valueStart);
    src =
      src.slice(0, valueStart) +
      JSON.stringify(value) +
      src.slice(valueEnd);
  }
  writeFileSync(path, src, "utf8");
  console.log("overlay", locale);
}
