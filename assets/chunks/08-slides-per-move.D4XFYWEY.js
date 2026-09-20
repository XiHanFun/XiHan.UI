const e=`// 一次移动一张 | slidesPerMove 与 slidesPerPage 分开提供：一屏显示三张、一次只移动一张，页数按剩余张数重新计算
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

const slides = ["A", "B", "C", "D", "E", "F"];

export default function Demo(): ReactNode {
  return (
    <XhCarouselRoot
      slideCount={slides.length}
      slidesPerPage={3}
      slidesPerMove={1}
      spacing="10px"
      style={{ inlineSize: "100%" }}
    >
      {({ page, totalPages, slideRange }) => (
        <>
          <XhCarouselPrevTrigger />
          <XhCarouselViewport style={{ blockSize: "110px" }}>
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
            {\`第 \${page + 1} / \${totalPages} 页 · 眼下露的是第 \${slideRange.start + 1} 到 \${slideRange.end + 1} 张\`}
          </span>
        </>
      )}
    </XhCarouselRoot>
  );
}
`;export{e as default};
