import { Link, useRouter } from "@tanstack/react-router";
import { forwardRef, type MouseEvent, type ReactNode } from "react";

type SlideLeftTo = "/shop" | "/configurator";

type SlideLeftLinkProps = {
  to: SlideLeftTo;
  className?: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function canStartViewTransition() {
  return typeof document.startViewTransition === "function";
}

export const SlideLeftLink = forwardRef<HTMLAnchorElement, SlideLeftLinkProps>(
  function SlideLeftLink({ to, className, children, onClick }, ref) {
    const router = useRouter();

    return (
      <Link
        ref={ref}
        to={to}
        className={className}
        onClick={(event) => {
          onClick?.(event);
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.altKey ||
            event.ctrlKey ||
            event.shiftKey
          ) {
            return;
          }

          if (!canStartViewTransition() || prefersReducedMotion()) {
            return;
          }

          event.preventDefault();
          document.startViewTransition(async () => {
            await router.navigate({ to });
          });
        }}
      >
        {children}
      </Link>
    );
  },
);
