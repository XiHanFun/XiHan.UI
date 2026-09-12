const e=`// 定高滚动 | 用 --xh-listbox-content-max-h 压住列表高度，条目多了就在容器里滚；方向键走到哪条，视图跟到哪条
import type { CSSProperties, ReactNode } from "react";
import { XhListboxRoot } from "@xihan-ui/react";
import { useState } from "react";

const tracks = Array.from({ length: 40 }, (_, i) => ({
  value: \`track-\${i + 1}\`,
  label: \`第 \${i + 1} 首\`,
}));

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<string[]>(["track-1"]);

  return (
    <>
      <XhListboxRoot
        value={picked}
        onValueChange={details => setPicked(details.value)}
        collection={tracks}
        label="曲目"
        style={{ "maxInlineSize": "320px", "--xh-listbox-content-max-h": "180px" } as CSSProperties}
      />
      <p>{\`已选：\${picked.length ? picked.join("、") : "（无）"}\`}</p>
    </>
  );
}
`;export{e as default};
