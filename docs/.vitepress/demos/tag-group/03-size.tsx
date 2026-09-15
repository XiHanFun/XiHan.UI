// 尺寸 | size 写在组上逐个落到每个标签上，使用 tag 的三档，标签自身不写档位
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
