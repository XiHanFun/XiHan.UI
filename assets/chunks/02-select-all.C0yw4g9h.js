const e=`// 全选与半选 | 使用 itemValues 计算全选和半选状态
import type { ReactNode } from "react";
import {
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
  XhCheckboxGroupSelectAllTrigger,
} from "@xihan-ui/react";

const items = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
  { value: "push", label: "推送通知" },
];
const itemValues = items.map(t => t.value);

export default function Demo(): ReactNode {
  return (
    <XhCheckboxGroupRoot defaultValue={["email"]} itemValues={itemValues}>
      <XhCheckboxGroupLabel>通知方式</XhCheckboxGroupLabel>
      <XhCheckboxGroupSelectAllTrigger>全选</XhCheckboxGroupSelectAllTrigger>
      {items.map(item => (
        <XhCheckboxGroupItem key={item.value} value={item.value}>
          <XhCheckboxGroupIndicator />
          <XhCheckboxGroupItemText>{item.label}</XhCheckboxGroupItemText>
        </XhCheckboxGroupItem>
      ))}
    </XhCheckboxGroupRoot>
  );
}
`;export{e as default};
