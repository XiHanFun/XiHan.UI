var e=`// 一次移动一张 | slidesPerMove 与 slidesPerPage 分开提供：一屏显示三张、一次只移动一张，页数按剩余张数重新计算
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

const slides = ["A", "B", "C", "D", "E", "F"];

export default function Demo(): ReactNode {
  const [page, setPage] = useState(0);

  return (
    <>
      <XhCarouselRoot
        slideCount={slides.length}
        slidesPerPage={3}
        slidesPerMove={1}
        spacing="10px"
        onPageChange={details => setPage(details.page)}
        style={{ inlineSize: "100%" }}
      >
        {({ totalPages }) => (
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
          </>
        )}
      </XhCarouselRoot>
      {/* 六张里一屏露三张、一次挪一张，落点共四个：第 N 页从第 N 张露起 */}
      <span data-demo-output>{\`第 \${page + 1} / 4 页 · 眼下露的是第 \${page + 1} 到 \${page + 3} 张\`}</span>
    </>
  );
}
`;export{e as default};