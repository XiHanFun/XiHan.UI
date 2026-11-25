// 尺寸与状态 | size 决定方框与条目文字的几何档位，组标题不随档；禁用项不可操作，只读项仍可聚焦
import type { ReactNode } from "react";
import { XhCheckboxGroupRoot } from "@xihan-ui/react";

const sizes = ["sm", "md", "lg"] as const;
const channels = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
];

const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
];

// 单项禁用写在数据里，条目部件上不必再声明一遍
const partly = [
  { value: "cheese", label: "芝士" },
  { value: "truffle", label: "松露", disabled: true },
];

const row = { display: "flex", flexWrap: "wrap", gap: "var(--xh-space-8)", alignItems: "flex-start" } as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-6)" }}>
      <div style={row}>
        {sizes.map(s => (
          <XhCheckboxGroupRoot key={s} collection={channels} defaultValue={["email"]} label={s} size={s} />
        ))}
      </div>

      <div style={row}>
        <XhCheckboxGroupRoot defaultValue={["cheese"]} collection={items} label="整组禁用" disabled />

        <XhCheckboxGroupRoot defaultValue={["cheese"]} collection={items} label="整组只读" readOnly />

        <XhCheckboxGroupRoot defaultValue={["cheese"]} collection={partly} label="单项禁用" />
      </div>
    </div>
  );
}
