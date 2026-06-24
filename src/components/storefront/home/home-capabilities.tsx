import { Link } from "@tanstack/react-router";

const WHY_WP_ALL_BANNER = "/home/why-wp-all.png";

export function HomeCapabilities() {
  return (
    <section>
      <Link
        to="/shop"
        className="group block overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
      >
        <img
          src={WHY_WP_ALL_BANNER}
          alt="ม่านในฝัน แค่ปลายนิ้ว — WP ALL"
          loading="lazy"
          decoding="async"
          className="aspect-[2.4/1] w-full object-cover transition-transform duration-300 group-hover:scale-[1.01] sm:aspect-[2.8/1] lg:aspect-[3/1]"
        />
      </Link>
    </section>
  );
}
