const n=`// 动态增删 | 标签清单归宿主维护；关掉当前这页时把选中值挪到相邻一项，全关完选中值是 null
import type { ReactNode } from "react";
import {
  XhButton,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

export default function Demo(): ReactNode {
  const [tabs, setTabs] = useState([
    { value: "doc-1", label: "文档 1" },
    { value: "doc-2", label: "文档 2" },
  ]);
  const [active, setActive] = useState<string | null>("doc-1");
  const seed = useRef(2);

  function addTab(): void {
    seed.current += 1;
    const value = \`doc-\${seed.current}\`;
    setTabs([...tabs, { value, label: \`文档 \${seed.current}\` }]);
    setActive(value);
  }

  function closeTab(value: string): void {
    const index = tabs.findIndex(tab => tab.value === value);
    if (index < 0) {
      return;
    }
    const next = tabs.filter(tab => tab.value !== value);
    setTabs(next);
    if (active !== value) {
      return;
    }
    // 关掉的正是当前页：往后顺延，没有后一项就退回最后一项
    const fallback = next[Math.min(index, next.length - 1)];
    setActive(fallback ? fallback.value : null);
  }

  return (
    <XhTabsRoot
      value={active}
      onValueChange={details => setActive(details.value)}
      variant="card"
      style={{ inlineSize: "100%" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <XhTabsList>
          {tabs.map(tab => (
            <XhTabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </XhTabsTrigger>
          ))}
        </XhTabsList>
        <XhButton size="sm" variant="outline" onClick={addTab}>新增一页</XhButton>
      </div>

      {tabs.map(tab => (
        <XhTabsContent key={tab.value} value={tab.value}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>{\`\${tab.label} 的内容\`}</span>
            <XhButton size="sm" variant="outline" onClick={() => closeTab(tab.value)}>
              关闭本页
            </XhButton>
          </div>
        </XhTabsContent>
      ))}

      {tabs.length === 0 ? <p>已经全部关掉，当前选中值是 null。</p> : null}
    </XhTabsRoot>
  );
}
`;export{n as default};
