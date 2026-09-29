const e=`// 拖拽排序 | 按住标签拖到新位置，或焦点在标签上按 Alt + 方向键挪一位
import type { ReactNode } from "react";
import {
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

interface View {
  value: string;
  label: string;
}

export default function Demo(): ReactNode {
  const [views, setViews] = useState<View[]>([
    { value: "board", label: "看板" },
    { value: "list", label: "列表" },
    { value: "calendar", label: "日历" },
    { value: "timeline", label: "时间线" },
  ]);

  // 元素只报重排好的新顺序，写回数据源才算挪动
  function move(details: { values: string[] }): void {
    setViews(details.values.map(value => views.find(view => view.value === value)!));
  }

  return (
    <XhTabsRoot
      defaultValue="board"
      collection={views}
      reorderable
      style={{ inlineSize: "420px", maxInlineSize: "100%" }}
      onTabMove={move}
    >
      <XhTabsList aria-label="视图">
        {views.map(view => (
          <XhTabsTrigger key={view.value} value={view.value}>{view.label}</XhTabsTrigger>
        ))}
        <XhTabsIndicator />
      </XhTabsList>

      {views.map(view => (
        <XhTabsContent key={view.value} value={view.value}>
          {\`按\${view.label}查看任务。\`}
        </XhTabsContent>
      ))}
    </XhTabsRoot>
  );
}
`;export{e as default};
