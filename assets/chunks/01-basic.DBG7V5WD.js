const e=`// 基础用法 | 预览与编辑两态轮流上场：点预览区或按「编辑」进编辑态，preview 不写内容、显示什么由组件填
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
        <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
        <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
        <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
      </XhEditableControl>
    </XhEditableRoot>
  );
}
`;export{e as default};
