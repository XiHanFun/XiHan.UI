// 尺寸 | size 只改变高度、内边距与字号，标签与清空按钮一起换档；不写即默认档
import type { ReactNode } from "react";
import {
  XhTextFieldClearTrigger,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      {/* 固定 outline 形态，只看档位的差别 */}
      <XhTextFieldRoot variant="outline" size="sm" defaultValue="小" clearable>
        <XhTextFieldLabel>sm</XhTextFieldLabel>
        <XhTextFieldControl>
          <XhTextFieldInput />
          <XhTextFieldClearTrigger />
        </XhTextFieldControl>
      </XhTextFieldRoot>

      <XhTextFieldRoot variant="outline" defaultValue="缺省" clearable>
        <XhTextFieldLabel>缺省</XhTextFieldLabel>
        <XhTextFieldControl>
          <XhTextFieldInput />
          <XhTextFieldClearTrigger />
        </XhTextFieldControl>
      </XhTextFieldRoot>

      <XhTextFieldRoot variant="outline" size="lg" defaultValue="大" clearable>
        <XhTextFieldLabel>lg</XhTextFieldLabel>
        <XhTextFieldControl>
          <XhTextFieldInput />
          <XhTextFieldClearTrigger />
        </XhTextFieldControl>
      </XhTextFieldRoot>
    </>
  );
}
