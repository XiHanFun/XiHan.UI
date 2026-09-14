// 提交方式 | 使用失焦或回车提交
import type { ReactNode } from "react";
import {
  XhEditableCancelTrigger,
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
  XhEditableSubmitTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhEditableRoot
        defaultValue="失焦即提交"
        placeholder="未填写"
        submitMode="blur"
      >
        <XhEditableLabel>submitMode = blur</XhEditableLabel>
        <XhEditableControl>
          <XhEditablePreview />
          <XhEditableInput />
          <XhEditableEditTrigger aria-label="编辑" />
          <XhEditableSubmitTrigger aria-label="确认" />
          <XhEditableCancelTrigger aria-label="取消" />
        </XhEditableControl>
      </XhEditableRoot>

      <XhEditableRoot
        defaultValue="回车才提交"
        placeholder="未填写"
        submitMode="enter"
      >
        <XhEditableLabel>submitMode = enter</XhEditableLabel>
        <XhEditableControl>
          <XhEditablePreview />
          <XhEditableInput />
          <XhEditableEditTrigger aria-label="编辑" />
          <XhEditableSubmitTrigger aria-label="确认" />
          <XhEditableCancelTrigger aria-label="取消" />
        </XhEditableControl>
      </XhEditableRoot>
    </>
  );
}
