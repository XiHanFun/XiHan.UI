const e=`// 基础用法 | 点击文本就地编辑
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
    <XhEditableRoot defaultValue="曦寒" placeholder="未填写">
      <XhEditableLabel>昵称</XhEditableLabel>
      <XhEditableControl>
        <XhEditablePreview />
        <XhEditableInput />
        <XhEditableEditTrigger aria-label="编辑" />
        <XhEditableSubmitTrigger aria-label="确认" />
        <XhEditableCancelTrigger aria-label="取消" />
      </XhEditableControl>
    </XhEditableRoot>
  );
}
`;export{e as default};
