const n=`// 校验状态 | 标记无效输入
import type { ReactNode } from "react";
import { XhComboboxRoot } from "@xihan-ui/react";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "chengdu", label: "Chengdu 成都" },
];

export default function Demo(): ReactNode {
  return (
    <XhComboboxRoot
      collection={cities}
      invalid
      label="常驻城市"
      openOnClick
      placeholder="请选择城市"
    />
  );
}
`;export{n as default};
