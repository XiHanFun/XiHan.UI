// 可滚动的标签栏 | 标签多到一行放不下时，把 list 装进作者自建的横滚容器，两端各摆一个滚动按钮
import type { ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@xihan-ui/icons";
import {
  XhButton,
  XhIcon,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/react";
import { useRef } from "react";

const tabs = Array.from({ length: 12 }, (_, i) => ({
  value: `module-${i + 1}`,
  label: `模块 ${i + 1}`,
}));

export default function Demo(): ReactNode {
  const viewport = useRef<HTMLDivElement | null>(null);

  function scrollStrip(delta: number): void {
    viewport.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <XhTabsRoot defaultValue="module-1" style={{ inlineSize: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <XhButton
          size="sm"
          variant="outline"
          aria-label="向前滚动"
          onClick={() => scrollStrip(-200)}
        >
          <XhIcon icon={ChevronLeftIcon} />
        </XhButton>

        {/* 滚动视口是 list 外面的一层普通容器：条目查询只以 list 为界，键盘与切换都不受它影响 */}
        <div ref={viewport} style={{ flex: 1, minInlineSize: 0, overflowX: "auto" }}>
          {/* 让 list 撑到内容宽度，基线才跟着标签一起滚 */}
          <XhTabsList style={{ inlineSize: "max-content" }}>
            {tabs.map(t => (
              <XhTabsTrigger key={t.value} value={t.value}>
                {t.label}
              </XhTabsTrigger>
            ))}
          </XhTabsList>
        </div>

        <XhButton
          size="sm"
          variant="outline"
          aria-label="向后滚动"
          onClick={() => scrollStrip(200)}
        >
          <XhIcon icon={ChevronRightIcon} />
        </XhButton>
      </div>

      {tabs.map(t => (
        <XhTabsContent key={t.value} value={t.value}>
          {`${t.label} 的面板`}
        </XhTabsContent>
      ))}
    </XhTabsRoot>
  );
}
