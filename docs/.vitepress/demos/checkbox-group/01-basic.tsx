// 基础用法 | 从一组选项中选择任意多项
import type { ReactNode } from "react";
import { XhCheckboxGroupRoot } from "@xihan-ui/react";

const items = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
  { value: "push", label: "推送通知" },
];

export default function Demo(): ReactNode {
  return (
    <XhCheckboxGroupRoot
      collection={items}
      defaultValue={["email"]}
      label="通知方式"
      name="notification"
    />
  );
}
