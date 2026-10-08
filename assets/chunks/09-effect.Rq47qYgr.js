var e=`// 淡入淡出换页 | effect="fade" 把各张叠放在同一格：翻页时新一张淡入、旧一张同时淡出，轨道不位移；按钮、键盘、指示点与循环照常，减弱动效下直接换
import type { ReactNode } from "react";
import {
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselList,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/react";

const slides = [
  { title: "城市夜景", background: "var(--xh-bg-brand-subtle)" },
  { title: "海岸线", background: "color-mix(in oklab, var(--xh-fg-success) 12%, var(--xh-bg-surface))" },
  { title: "雪山", background: "color-mix(in oklab, var(--xh-fg-warning) 12%, var(--xh-bg-surface))" },
];

export default function Demo(): ReactNode {
  return (
    <XhCarouselRoot slideCount={slides.length} effect="fade" loop style={{ inlineSize: "100%" }}>
      {({ totalPages }) => (
        <>
          <XhCarouselPrevTrigger />
          <XhCarouselViewport style={{ blockSize: "176px" }}>
            <XhCarouselList>
              {slides.map((slide, i) => (
                <XhCarouselItem key={slide.title} index={i}>
                  <div
                    style={{
                      display: "grid",
                      placeItems: "center",
                      blockSize: "100%",
                      background: slide.background,
                      color: "var(--xh-fg-default)",
                    }}
                  >
                    {slide.title}
                  </div>
                </XhCarouselItem>
              ))}
            </XhCarouselList>
          </XhCarouselViewport>
          <XhCarouselNextTrigger />
          <XhCarouselIndicatorGroup>
            {Array.from({ length: totalPages }, (_, p) => (
              <XhCarouselIndicator key={p} index={p} />
            ))}
          </XhCarouselIndicatorGroup>
        </>
      )}
    </XhCarouselRoot>
  );
}
`;export{e as default};