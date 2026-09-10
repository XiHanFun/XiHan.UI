// 尺寸 | size 打在组上逐枚落到每一枚标签上，走 tag 的三档，标签自己不写档位
import type { ReactNode } from "react";
import { XhTagGroupRoot } from "@xihan-ui/react";

const tags = [
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
      <XhTagGroupRoot collection={tags} size="sm" label="小档" />
      <XhTagGroupRoot collection={tags} label="缺省档" />
      <XhTagGroupRoot collection={tags} size="lg" label="大档" />
    </div>
  );
}
