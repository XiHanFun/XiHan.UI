const e=`// 基础用法 | 张数由 slideCount 声明而不是从 DOM 数，页数与指示点数量都由它算出来
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

const slides = ["第一张", "第二张", "第三张"];

export default function Demo(): ReactNode {
  return (
    <XhCarouselRoot slideCount={slides.length} style={{ inlineSize: "100%" }}>
      {({ totalPages }) => (
        <>
          <XhCarouselPrevTrigger />
          {/* 视口只负责裁切，高度由页面给：不给高度就没有可裁的窗口 */}
          <XhCarouselViewport style={{ blockSize: "140px" }}>
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
            {/* 指示点一页一个，作者照着 totalPages 渲染 */}
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
