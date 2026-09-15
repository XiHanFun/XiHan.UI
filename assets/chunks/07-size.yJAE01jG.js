const e=`// 尺寸 | 不传 size 即默认档；行高、内边距与字号一起换档，标题也跟着变
import type { Size } from "@xihan-ui/core";
import type { ReactNode } from "react";
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/react";

const sizes: { size: Size | undefined; label: string }[] = [
  { size: "sm", label: "sm" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "lg" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "16px" }}>
      {sizes.map(s => (
        <XhTimeFieldRoot key={s.label} size={s.size} defaultValue="09:30">
          <XhTimeFieldLabel>{s.label}</XhTimeFieldLabel>
          <XhTimeFieldControl>
            <XhTimeFieldSegmentGroup>
              <XhTimeFieldSegment segment="hour" />
              <span>:</span>
              <XhTimeFieldSegment segment="minute" />
            </XhTimeFieldSegmentGroup>
          </XhTimeFieldControl>
        </XhTimeFieldRoot>
      ))}
    </div>
  );
}
`;export{e as default};
