const e=`// 受控 | 传了 value 就由宿主说了算；值可以是 null，表示一段都没选中
import type { ReactNode } from "react";
import { XhSegmentedRoot } from "@xihan-ui/react";
import { useState } from "react";

const views = [
  { value: "list", label: "列表" },
  { value: "board", label: "看板" },
  { value: "calendar", label: "日历" },
];

export default function Demo(): ReactNode {
  const [view, setView] = useState<string | null>("list");

  return (
    <>
      <XhSegmentedRoot
        value={view}
        onValueChange={details => setView(details.value)}
        collection={views}
        aria-label="视图"
      />
      <span>{\`当前：\${view ?? "（未选）"}\`}</span>
      <button type="button" onClick={() => setView(null)}>清空</button>
    </>
  );
}
`;export{e as default};
