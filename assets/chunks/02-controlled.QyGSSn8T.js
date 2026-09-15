const e=`// 受控 | 传了 page 就由宿主说了算，组件只发 page-change 不自己改页码，宿主写回它才动
import type { ReactNode } from "react";
import {
  XhCarouselItem,
  XhCarouselList,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/react";
import { useState } from "react";

const slides = ["登录", "选套餐", "付款"];

export default function Demo(): ReactNode {
  const [page, setPage] = useState(1);

  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px" }}>
      <XhCarouselRoot
        page={page}
        onPageChange={details => setPage(details.page)}
        slideCount={slides.length}
      >
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
      </XhCarouselRoot>

      {/* 页码握在宿主手里，外部按钮直接改它 */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {slides.map((text, i) => (
          <button key={text} type="button" onClick={() => setPage(i)}>
            {\`跳到「\${text}」\`}
          </button>
        ))}
        <span>{\`当前第 \${page + 1} 张\`}</span>
      </div>
    </div>
  );
}
`;export{e as default};
