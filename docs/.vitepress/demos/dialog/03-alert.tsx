// 警示对话框 | role=alertdialog 交给读屏更强的语气；关掉 Esc 与点遮罩后，只剩里面这两颗按钮能走出去
import type { ReactNode } from "react";
import {
  XhButton,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhDialogRoot
      role="alertdialog"
      closeOnEscape={false}
      closeOnInteractOutside={false}
    >
      {({ setOpen }) => (
        <>
          <XhDialogTrigger>删除这台设备</XhDialogTrigger>
          <XhDialogContent>
            <XhDialogTitle>删除后不可恢复</XhDialogTitle>
            <XhDialogDescription>
              设备上的离线数据会一并清除，请确认这是你要的结果。
            </XhDialogDescription>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <XhButton variant="outline" onClick={() => setOpen(false)}>再想想</XhButton>
              <XhButton variant="solid" onClick={() => setOpen(false)}>确认删除</XhButton>
            </div>
          </XhDialogContent>
        </>
      )}
    </XhDialogRoot>
  );
}
