// 指示点悬停切页 | 指示点上补一个原生 mouseenter 就是悬停切页，组件自带的点击翻页照旧
import type { ReactNode } from "react";
import {
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselList,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/react";

const slides = ["城市夜景", "海岸线", "雪山", "沙漠"];

export default function Demo(): ReactNode {
  return (
    <XhCarouselRoot slideCount={slides.length} style={{ inlineSize: "100%" }}>
      {({ page, totalPages, setPage }) => (
        <>
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
          <XhCarouselIndicatorGroup>
            {/* mouseenter 是落到指示点按钮上的原生事件，组件自带的点击不受影响 */}
            {Array.from({ length: totalPages }, (_, p) => (
              <XhCarouselIndicator key={p} index={p} onMouseEnter={() => setPage(p)} />
            ))}
          </XhCarouselIndicatorGroup>
          <span style={{ flexBasis: "100%" }}>
            {`鼠标扫过下面的圆点即可换页，当前第 ${page + 1} / ${totalPages} 页`}
          </span>
        </>
      )}
    </XhCarouselRoot>
  );
}
