var e=`// 指示点悬停切页 | 指示点上补一个原生 mouseenter 即为悬停切页，组件自带的点击翻页照常
import type { ReactNode } from "react";
import {
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselList,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/react";
import { useState } from "react";

const slides = ["城市夜景", "海岸线", "雪山", "沙漠"];

export default function Demo(): ReactNode {
  const [current, setCurrent] = useState(0);

  return (
    <>
      <XhCarouselRoot
        slideCount={slides.length}
        onPageChange={details => setCurrent(details.page)}
        style={{ inlineSize: "100%" }}
      >
        {({ totalPages, setPage }) => (
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
          </>
        )}
      </XhCarouselRoot>
      <span data-demo-output>{\`鼠标扫过圆点即可换页 · 当前第 \${current + 1} / \${slides.length} 页\`}</span>
    </>
  );
}
`;export{e as default};