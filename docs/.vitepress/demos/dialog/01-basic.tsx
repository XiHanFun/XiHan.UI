// 基础用法 | 不传 open 即为非受控；Esc 或点遮罩关闭，关闭后焦点回到触发按钮
import type { ReactNode } from "react";
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    // 带载荷的默认插槽写成函数式 children，setOpen 从载荷里取
    <XhDialogRoot translations={{ close: "关闭" }}>
      {({ setOpen }) => (
        <>
          <XhDialogTrigger>打开对话框</XhDialogTrigger>
          <XhDialogContent>
            <XhDialogTitle>确认发布</XhDialogTitle>
            <XhDialogDescription>
              发布后这篇文档对所有人可见，之后仍可撤回。
            </XhDialogDescription>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <XhButton variant="ghost" onClick={() => setOpen(false)}>取消</XhButton>
              <XhButton variant="solid" onClick={() => setOpen(false)}>发布</XhButton>
            </div>
            <XhDialogCloseTrigger />
          </XhDialogContent>
        </>
      )}
    </XhDialogRoot>
  );
}
