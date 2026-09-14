// 纵向轨道 | orientation 换成 vertical 后轨道竖着位移，两端按钮落到上下两头，翻页认的是上下方向键
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
  { time: "09:00", title: "晨会", description: "同步今天的目标与阻塞项。" },
  { time: "11:00", title: "客户沟通", description: "确认需求范围与交付节奏。" },
  { time: "15:00", title: "联调", description: "核对三端行为与视觉结果。" },
];

export default function Demo(): ReactNode {
  return (
    <XhCarouselRoot
      orientation="vertical"
      slideCount={slides.length}
      style={{ inlineSize: "min(360px, 100%)" }}
    >
      {({ totalPages }) => (
        <>
          <XhCarouselPrevTrigger />
          {/* 纵轨的裁切窗口靠高度定，宽度交给根节点 */}
          <XhCarouselViewport style={{ blockSize: "200px", inlineSize: "100%" }}>
            <XhCarouselList>
              {slides.map((slide, i) => (
                <XhCarouselItem key={slide.time} index={i}>
                  <article style={{ display: "grid", alignContent: "center", gap: "6px", blockSize: "100%", padding: "32px", background: "var(--xh-bg-subtle)", color: "var(--xh-fg-default)" }}>
                    <span style={{ color: "var(--xh-fg-brand)", fontSize: "var(--xh-text-caption-size)" }}>{slide.time}</span>
                    <strong style={{ color: "var(--xh-fg-default)", fontSize: "var(--xh-text-heading-3-size)" }}>{slide.title}</strong>
                    <span style={{ color: "var(--xh-fg-muted)" }}>{slide.description}</span>
                  </article>
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
