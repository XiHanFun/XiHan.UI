const e=`// 自动播放与暂停 | autoplay 传毫秒即间隔；开启后必须渲染播放开关，自动翻页必须能够停止
import type { ReactNode } from "react";
import {
  XhCarouselAutoplayTrigger,
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselList,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/react";

const slides = ["公告一", "公告二", "公告三"];

export default function Demo(): ReactNode {
  return (
    <XhCarouselRoot
      slideCount={slides.length}
      autoplay={2500}
      loop
      style={{ inlineSize: "100%" }}
    >
      {({ totalPages }) => (
        <>
          <XhCarouselPrevTrigger />
          <XhCarouselViewport style={{ blockSize: "120px" }}>
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
          <XhCarouselAutoplayTrigger />
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
