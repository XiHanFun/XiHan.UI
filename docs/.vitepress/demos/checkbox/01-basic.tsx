// 基础用法 | 标记一个独立选项
import type { ReactNode } from "react";
import { XhCheckbox } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhCheckbox name="updates" defaultChecked>接收产品更新</XhCheckbox>;
}
