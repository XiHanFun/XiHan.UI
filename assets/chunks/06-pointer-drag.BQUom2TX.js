var e=`// 指针拖拽 | allowPointerDrag 开启后按住轨道即可拖动，松手落回整页；关闭则只有触摸的原生滚动
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
import { useState } from "react";

const slides = ["拖我", "再拖", "还能拖", "最后一张"];

export default function Demo(): ReactNode {
  const [page, setPage] = useState(0);

  return (
    <>
      <XhCarouselRoot
        slideCount={slides.length}
        allowPointerDrag
        loop
        onPageChange={details => setPage(details.page)}
        style={{ inlineSize: "100%" }}
      >
        {({ totalPages }) => (
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
          </>
        )}
      </XhCarouselRoot>
      <span data-demo-output>{\`第 \${page + 1} / \${slides.length} 页\`}</span>
    </>
  );
}
`;export{e as default};