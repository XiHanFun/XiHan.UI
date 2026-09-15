// 受控 | 传入 open 后由宿主决定，组件自身不再修改状态；Esc、点击遮罩、按关闭按钮都只回写 open
import type { ReactNode } from "react";
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <XhButton variant="solid" onClick={() => setOpen(true)}>打开</XhButton>
        <span>{`当前：${open ? "展开" : "收起"}`}</span>
      </div>

      <XhDialogRoot
        open={open}
        onOpenChange={details => setOpen(details.open)}
        translations={{ close: "关闭" }}
      >
        <XhDialogContent>
          <XhDialogTitle>受控对话框</XhDialogTitle>
          <XhDialogDescription>
            这里没有 trigger，开合完全由外面那颗按钮与 open 决定。
          </XhDialogDescription>
          <XhDialogCloseTrigger />
        </XhDialogContent>
      </XhDialogRoot>
    </>
  );
}
