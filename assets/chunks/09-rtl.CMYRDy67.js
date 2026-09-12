const o=`// 书写方向 | start / end 是逻辑对齐不是左右：RTL 下 bottom-start 贴的是锚点右缘，块轴上的对齐不受影响
import type { ReactNode } from "react";
import {
  XhButton,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [dir, setDir] = useState<"ltr" | "rtl">("rtl");

  return (
    <div style={{ display: "grid", gap: "12px", justifyItems: "start" }}>
      <XhButton size="sm" variant="outline" onClick={() => setDir(dir === "ltr" ? "rtl" : "ltr")}>
        {\`当前方向：\${dir}（点一下切换）\`}
      </XhButton>

      <div dir={dir} style={{ display: "flex", gap: "24px" }}>
        <XhPopoverRoot dir={dir} placement="bottom-start">
          <XhPopoverTrigger>
            <XhButton size="sm">bottom-start</XhButton>
          </XhPopoverTrigger>
          <XhPopoverPositioner>
            <XhPopoverContent>
              <XhPopoverTitle>start</XhPopoverTitle>
              <p style={{ margin: 0 }}>LTR 贴左缘，RTL 贴右缘</p>
            </XhPopoverContent>
          </XhPopoverPositioner>
        </XhPopoverRoot>

        <XhPopoverRoot dir={dir} placement="bottom-end">
          <XhPopoverTrigger>
            <XhButton size="sm">bottom-end</XhButton>
          </XhPopoverTrigger>
          <XhPopoverPositioner>
            <XhPopoverContent>
              <XhPopoverTitle>end</XhPopoverTitle>
              <p style={{ margin: 0 }}>与 start 恰好相反</p>
            </XhPopoverContent>
          </XhPopoverPositioner>
        </XhPopoverRoot>
      </div>
    </div>
  );
}
`;export{o as default};
