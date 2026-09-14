// 指针拖拽 | allowPointerDrag 打开后按住轨道就能拖着走，松手落回整页；关掉则只有触摸的原生滚动
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

const slides = ["拖我", "再拖", "还能拖", "最后一张"];

export default function Demo(): ReactNode {
  return (
    <XhCarouselRoot
      slideCount={slides.length}
      allowPointerDrag
      loop
      style={{ inlineSize: "100%" }}
    >
      {({ page, totalPages, dragging }) => (
        <>
          <XhCarouselPrevTrigger />
          <XhCarouselViewport style={{ blockSize: "130px" }}>
            <XhCarouselList>
              {slides.map((text, i) => (
                <XhCarouselItem key={text} index={i}>
                  <div style={{ display: "grid", placeItems: "center", blockSize: "100%" }}>
                    {text}
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
          <span style={{ flexBasis: "100%" }}>
            {`第 ${page + 1} / ${totalPages} 页 · ${dragging ? "正在拖" : "松手状态"}`}
          </span>
        </>
      )}
    </XhCarouselRoot>
  );
}
