// 基础用法 | 只写根组件就按标准结构铺出标题与输入框，clearable 带上清空按钮；不传 value 即为非受控，组件自行维护值
import type { ReactNode } from "react";
import { XhTextFieldRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhTextFieldRoot label="邮箱" name="email" type="email" placeholder="输入你的邮箱" clearable />;
}
