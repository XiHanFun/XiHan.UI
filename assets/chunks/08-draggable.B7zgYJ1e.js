const n=`// 可拖动 | draggable 让标题栏成为拖动区，面板始终夹在视口内；标题栏里的拖动把手让键盘也能挪：方向键挪一步，Enter 回到居中
import type { ReactNode } from "react";
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogDragTrigger,
  XhDialogHeader,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhDialogRoot draggable translations={{ close: "关闭", dragTrigger: "移动对话框" }}>
      {({ setOpen }) => (
        <>
          <XhDialogTrigger>打开可拖动的对话框</XhDialogTrigger>
          <XhDialogContent>
            <XhDialogHeader>
              <XhDialogDragTrigger />
              <XhDialogTitle>拖住标题栏挪窗口</XhDialogTitle>
              <XhDialogDescription>每次打开都从正中开始；拖出视口的那一截会被夹回来。</XhDialogDescription>
            </XhDialogHeader>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <XhButton variant="solid" onClick={() => setOpen(false)}>关闭</XhButton>
            </div>
            <XhDialogCloseTrigger />
          </XhDialogContent>
        </>
      )}
    </XhDialogRoot>
  );
}
`;export{n as default};
