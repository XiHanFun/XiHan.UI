// 状态 | 禁用、只读与空值
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
      <XhEditableRoot defaultValue="改不动" placeholder="未填写" disabled>
        <XhEditableLabel>禁用</XhEditableLabel>
        <XhEditableControl>
          <XhEditablePreview />
          <XhEditableInput />
          <XhEditableEditTrigger aria-label="编辑" />
          <XhEditableSubmitTrigger aria-label="确认" />
          <XhEditableCancelTrigger aria-label="取消" />
        </XhEditableControl>
      </XhEditableRoot>

      <XhEditableRoot defaultValue="只能看" placeholder="未填写" readOnly>
        <XhEditableLabel>只读</XhEditableLabel>
        <XhEditableControl>
          <XhEditablePreview />
          <XhEditableInput />
          <XhEditableEditTrigger aria-label="编辑" />
          <XhEditableSubmitTrigger aria-label="确认" />
          <XhEditableCancelTrigger aria-label="取消" />
        </XhEditableControl>
      </XhEditableRoot>

      <XhEditableRoot placeholder="未填写">
        <XhEditableLabel>空值占位</XhEditableLabel>
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
