const n=`// 受控 | 传了 open 就由宿主说了算，组件只发 open-change 不自己改展开态
import type { ReactNode } from "react";
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 外部按钮直接改 open，菜单照样展开 */}
      <button type="button" onClick={() => setOpen(!open)}>
        {open ? "从外面收起" : "从外面展开"}
      </button>

      <XhMenuRoot open={open} onOpenChange={details => setOpen(details.open)}>
        <XhMenuTrigger>操作</XhMenuTrigger>
        <XhMenuPositioner>
          <XhMenuContent>
            <XhMenuItem value="rename">重命名</XhMenuItem>
            <XhMenuItem value="duplicate">创建副本</XhMenuItem>
          </XhMenuContent>
        </XhMenuPositioner>
      </XhMenuRoot>

      <span>{\`当前：\${open ? "展开" : "收起"}\`}</span>
    </>
  );
}
`;export{n as default};
