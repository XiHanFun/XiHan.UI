const e=`// 并排与折叠 | 并排两列都发格子，空的那一侧照发；远离变更的连续上下文折成一格，点开即展开
import type { ReactNode } from "react";
import { computeTextDiff } from "@xihan-ui/headless";
import { XhDiffViewBody, XhDiffViewHeader, XhDiffViewRoot, XhDiffViewSummary, XhDiffViewViewport } from "@xihan-ui/react";
import { useState } from "react";

const before = Array.from({ length: 24 }, (_, i) => \`const step\${i} = pipeline.at(\${i})\`).join("\\n");
const after = before
  .replace("const step1 = pipeline.at(1)", "const step1 = pipeline.head()")
  .replace("const step22 = pipeline.at(22)", "const step22 = pipeline.tail()");

// contextLines 给大一点，让模型里保住整段上下文，折叠交给组件
const model = computeTextDiff(before, after, { contextLines: 24 });

export default function Demo(): ReactNode {
  const [expanded, setExpanded] = useState<string[]>([]);

  return (
    <XhDiffViewRoot
      expandedValue={expanded}
      onExpandedValueChange={details => setExpanded(details.value)}
      model={model}
      view="split"
      contextLines={3}
    >
      <XhDiffViewHeader>
        <span>src/pipeline.ts</span>
        <XhDiffViewSummary change="added" />
        <XhDiffViewSummary change="removed" />
      </XhDiffViewHeader>
      <XhDiffViewViewport>
        <XhDiffViewBody />
      </XhDiffViewViewport>
    </XhDiffViewRoot>
  );
}
`;export{e as default};
