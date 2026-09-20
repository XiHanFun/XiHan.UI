const e=`// 尺寸 | size 决定方框与条目文字的几何档位，组标题不随档
import type { ReactNode } from "react";
import { XhCheckboxGroupRoot } from "@xihan-ui/react";

const sizes = ["sm", "md", "lg"] as const;
const items = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "flex-start" }}>
      {sizes.map(s => (
        <XhCheckboxGroupRoot key={s} collection={items} defaultValue={["email"]} label={s} size={s} />
      ))}
    </div>
  );
}
`;export{e as default};
