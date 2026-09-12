const n=`// 切换后滚进视野 | 每个标签都带 data-value 身份标记，选中值一变就按它取到那个标签，滚到视口正中
import type { ReactNode } from "react";
import {
  XhButton,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/react";
import { useEffect, useRef, useState } from "react";

const tabs = Array.from({ length: 12 }, (_, i) => ({
  value: \`chapter-\${i + 1}\`,
  label: \`第 \${i + 1} 章\`,
}));

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string | null>("chapter-1");
  const viewport = useRef<HTMLDivElement | null>(null);

  // 盯的是选中值而不是切换事件：外部改值、键盘走位、点击三条路都在这里收口
  useEffect(() => {
    viewport.current
      ?.querySelector<HTMLElement>(\`[data-part="trigger"][data-value="\${value}"]\`)
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [value]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "100%" }}>
      <XhTabsRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        variant="segment"
      >
        <div ref={viewport} style={{ overflowX: "auto" }}>
          <XhTabsList style={{ inlineSize: "max-content" }}>
            {tabs.map(t => (
              <XhTabsTrigger key={t.value} value={t.value}>
                {t.label}
              </XhTabsTrigger>
            ))}
          </XhTabsList>
        </div>

        {tabs.map(t => (
          <XhTabsContent key={t.value} value={t.value}>
            {\`\${t.label} 的面板\`}
          </XhTabsContent>
        ))}
      </XhTabsRoot>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <XhButton size="sm" variant="outline" onClick={() => setValue("chapter-12")}>
          跳到第 12 章
        </XhButton>
        <XhButton size="sm" variant="outline" onClick={() => setValue("chapter-1")}>
          回到第 1 章
        </XhButton>
        <span>用方向键走位时，标签栏也会跟着滚</span>
      </div>
    </div>
  );
}
`;export{n as default};
