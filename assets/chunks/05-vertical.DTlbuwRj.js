const e=`// 纵向轨道 | orientation 换成 vertical 后轨道竖着位移，两端按钮落到上下两头，翻页认的是上下方向键
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

const slides = ["09:00 晨会", "11:00 客户沟通", "15:00 联调"];

export default function Demo(): ReactNode {
  return (
    <XhCarouselRoot
      orientation="vertical"
      slideCount={slides.length}
      style={{ inlineSize: "240px" }}
    >
      {({ page, totalPages }) => (
        <>
          <XhCarouselPrevTrigger>∧</XhCarouselPrevTrigger>
          {/* 纵轨的裁切窗口靠高度定，宽度交给根节点 */}
          <XhCarouselViewport style={{ blockSize: "96px", inlineSize: "100%" }}>
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
          <XhCarouselNextTrigger>∨</XhCarouselNextTrigger>
          <XhCarouselIndicatorGroup>
            {Array.from({ length: totalPages }, (_, p) => (
              <XhCarouselIndicator key={p} index={p} />
            ))}
          </XhCarouselIndicatorGroup>
          <span>{\`第 \${page + 1} / \${totalPages} 条\`}</span>
        </>
      )}
    </XhCarouselRoot>
  );
}
`;export{e as default};
