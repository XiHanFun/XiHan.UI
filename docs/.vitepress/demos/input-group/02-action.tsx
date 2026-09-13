// 动作 | 将关联操作放在输入框末端
import type { ReactNode } from "react";
import {
  XhButton,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhInputGroupRoot>
      <XhTextFieldRoot placeholder="搜索文档">
        <XhTextFieldControl>
          <XhTextFieldInput aria-label="搜索文档" />
        </XhTextFieldControl>
      </XhTextFieldRoot>
      <XhButton variant="solid">搜索</XhButton>
    </XhInputGroupRoot>
  );
}
