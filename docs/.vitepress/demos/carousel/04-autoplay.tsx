// 自动播放与暂停 | autoplay 给毫秒即间隔；开了它就得渲播放开关，自动翻页必须能停住
import type { ReactNode } from "react";
import {
  XhCarouselAutoplayTrigger,
  XhCarouselItem,
  XhCarouselList,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/react";

const slides = ["公告一", "公告二", "公告三"];

// 自动播放的三种去处：正在播、被临时按住、已停
function playState(autoplaying: boolean, paused: boolean): string {
  if (autoplaying)
    return "自动播放中";
  return paused ? "被按住" : "已停";
}

export default function Demo(): ReactNode {
  return (
    <XhCarouselRoot
      slideCount={slides.length}
      autoplay={2500}
      loop
      style={{ inlineSize: "100%" }}
    >
      {({ page, totalPages, autoplaying, paused }) => (
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
          {/* root 自己就是会换行的横排 flex，回显想独占一行得自己占满 */}
          <span style={{ flexBasis: "100%" }}>
            {`第 ${page + 1} / ${totalPages} 页 · ${playState(autoplaying, paused)}`}
          </span>
        </>
      )}
    </XhCarouselRoot>
  );
}
