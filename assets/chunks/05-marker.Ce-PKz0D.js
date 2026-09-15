const n=`// 自定义展开标记 | 往指示符部件里塞自己的图形，转向仍由皮肤按 open 接管
import type { ReactNode } from "react";
import { ChevronDownIcon } from "@xihan-ui/icons";
import {
  XhCollapsibleContent,
  XhCollapsibleIndicator,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
  XhIcon,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ width: "100%", maxWidth: "420px", display: "grid", gap: "12px" }}>
      <XhCollapsibleRoot open={open} onOpenChange={details => setOpen(details.open)}>
        <XhCollapsibleTrigger>
          <span>高级筛选</span>
          <span style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "2px" }}>
            {open ? "收起" : "展开"}
            {/* 部件里放什么归作者；transform 由皮肤跟着 data-state 打 */}
            <XhCollapsibleIndicator>
              <XhIcon icon={ChevronDownIcon} />
            </XhCollapsibleIndicator>
          </span>
        </XhCollapsibleTrigger>
        <XhCollapsibleContent>
          创建时间、负责人、标签这些不常用的条件收在这里。
        </XhCollapsibleContent>
      </XhCollapsibleRoot>
    </div>
  );
}
`;export{n as default};
