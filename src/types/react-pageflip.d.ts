declare module "react-pageflip" {
  import type { CSSProperties, ReactNode, Ref } from "react";

  export type FlipEvent = { data: number };

  export type HTMLFlipBookProps = {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    className?: string;
    style?: CSSProperties;
    drawShadow?: boolean;
    maxShadowOpacity?: number;
    flippingTime?: number;
    usePortrait?: boolean;
    onFlip?: (event: FlipEvent) => void;
    children: ReactNode;
    ref?: Ref<{
      pageFlip: () => {
        flip: (page: number) => void;
        flipNext: () => void;
        flipPrev: () => void;
        getCurrentPageIndex: () => number;
        getPageCount: () => number;
      };
    }>;
  };

  export default function HTMLFlipBook(props: HTMLFlipBookProps): ReactNode;
}
