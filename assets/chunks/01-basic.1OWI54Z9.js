const n=`// 基础用法 | 组内只有一个 Tab 停靠点，进组后四个方向键都能切换
import type { ReactNode } from "react";
import { XhRadioGroupRoot } from "@xihan-ui/react";

const plans = [
  { value: "free", label: "免费版" },
  { value: "standard", label: "标准版" },
  { value: "pro", label: "专业版" },
];

export default function Demo(): ReactNode {
  return (
    <XhRadioGroupRoot
      collection={plans}
      defaultValue="standard"
      label="套餐"
      name="plan"
    />
  );
}
`;export{n as default};
