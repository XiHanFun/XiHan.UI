// 受控 | 传入 open 后由宿主决定；Escape、点击面板外、按关闭按钮都只回写 open，不自行修改状态
import type { ReactNode } from "react";
import {
  XhButton,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <XhDrawerRoot
      open={open}
      side="left"
      translations={{ close: "关闭" }}
      onOpenChange={details => setOpen(details.open)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <XhButton variant="solid" onClick={() => setOpen(true)}>打开左侧抽屉</XhButton>
        <span>
          当前：
          {open ? "展开" : "收起"}
        </span>
      </div>
      <XhDrawerContent>
        <XhDrawerTitle>受控抽屉</XhDrawerTitle>
        <XhDrawerDescription>
          这里没有 trigger，开合完全跟着外面那颗按钮与 open 走。
        </XhDrawerDescription>
        <XhDrawerCloseTrigger />
      </XhDrawerContent>
    </XhDrawerRoot>
  );
}
