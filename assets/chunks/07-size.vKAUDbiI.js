const e=`// 尺寸 | size 换的是段的高度、内边距与字号，指示器跟着量出来的段走
import type { ReactNode } from "react";
import { XhSegmentedRoot } from "@xihan-ui/react";

const sizes = ["sm", "md", "lg"] as const;
const aligns = [
  { value: "start", label: "左" },
  { value: "center", label: "中" },
  { value: "end", label: "右" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
      {sizes.map(s => (
        <XhSegmentedRoot
          key={s}
          collection={aligns}
          size={s}
          aria-label={s}
          defaultValue="center"
        />
      ))}
    </div>
  );
}
`;export{e as default};
