// 基础用法 | 单选
import type { ReactNode } from "react";
import { XhSelectRoot } from "@xihan-ui/react";

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "blueberry", label: "蓝莓" },
  { value: "cherry", label: "樱桃（缺货）", disabled: true },
  { value: "durian", label: "榴莲" },
];

export default function Demo(): ReactNode {
  return <XhSelectRoot collection={fruits} defaultValue={["banana"]} label="水果" placeholder="请选择" />;
}
