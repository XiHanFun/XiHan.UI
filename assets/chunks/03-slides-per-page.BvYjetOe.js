const e=`// 一屏多张 | slidesPerPage 决定一屏显示几张，一次翻几张默认跟随它，因此仍是整屏翻页
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

const slides = ["一", "二", "三", "四", "五", "六"];

export default function Demo(): ReactNode {
  return (
    <XhCarouselRoot
      slideCount={slides.length}
      slidesPerPage={2}
      spacing="12px"
      style={{ inlineSize: "100%" }}
    >
      {({ totalPages }) => (
        <>
          {/* 不回绕：首页的上一张与末页的下一张转成原生 disabled */}
          <XhCarouselPrevTrigger />
          <XhCarouselViewport style={{ blockSize: "120px" }}>
            <XhCarouselList>
              {slides.map((text, i) => (
                <XhCarouselItem key={text} index={i}>
                  <div style={{ display: "grid", placeItems: "center", blockSize: "100%" }}>
                    {\`第 \${text} 张\`}
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
