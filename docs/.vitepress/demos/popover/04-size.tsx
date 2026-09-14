// 尺寸 | 三档换的是浮层的内边距与字号，不写 size 即缺省档；逐个点开触发器看差别
import type { ReactNode } from "react";
import {
  XhPopoverArrow,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/react";

const sizes = [
  { value: "sm", label: "小" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "大" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {sizes.map(s => (
        <XhPopoverRoot key={s.label} size={s.value} placement="bottom-start">
          <XhPopoverTrigger>{s.label}</XhPopoverTrigger>
          <XhPopoverPositioner>
            <XhPopoverContent>
              <XhPopoverTitle>{`${s.label}档`}</XhPopoverTitle>
              <XhPopoverDescription>
                {`size = ${s.value ?? "未指定"}。`}
              </XhPopoverDescription>
              <XhPopoverArrow />
            </XhPopoverContent>
          </XhPopoverPositioner>
        </XhPopoverRoot>
      ))}
    </div>
  );
}
