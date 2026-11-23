// 全屏 | fullscreen 让面板铺满视口：头尾定在原处，正文吃掉剩下的高度；内容多到值得占满一屏时用，比如编辑一份长表单
import type { ReactNode } from "react";
import {
  XhButton,
  XhDialogBody,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogFooter,
  XhDialogHeader,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhDialogRoot fullscreen translations={{ close: "关闭" }}>
      {({ setOpen }) => (
        <>
          <XhDialogTrigger>全屏编辑</XhDialogTrigger>
          <XhDialogContent>
            <XhDialogHeader>
              <XhDialogTitle>编辑季度报表</XhDialogTitle>
            </XhDialogHeader>
            <XhDialogBody>
              <p>正文占满头尾之间的全部高度，内容超出时在这一段里滚动。</p>
            </XhDialogBody>
            <XhDialogFooter>
              <XhButton onClick={() => setOpen(false)}>取消</XhButton>
              <XhButton variant="solid" onClick={() => setOpen(false)}>保存</XhButton>
            </XhDialogFooter>
            <XhDialogCloseTrigger />
          </XhDialogContent>
        </>
      )}
    </XhDialogRoot>
  );
}
