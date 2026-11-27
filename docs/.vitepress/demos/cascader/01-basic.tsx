// 基础用法 | 只写根组件就按 collection 铺出标题、触发器与逐级展开的各列，按层级选择完整地区路径；Web Components 的数据经 property 交
import type { ReactNode } from "react";
import { XhCascaderRoot } from "@xihan-ui/react";

const regions = [
  {
    value: "zhejiang",
    label: "浙江",
    children: [
      {
        value: "hangzhou",
        label: "杭州",
        children: [
          { value: "xihu", label: "西湖区" },
          { value: "binjiang", label: "滨江区" },
        ],
      },
      {
        value: "ningbo",
        label: "宁波",
        children: [{ value: "haishu", label: "海曙区" }],
      },
    ],
  },
  {
    value: "jiangsu",
    label: "江苏",
    children: [
      {
        value: "nanjing",
        label: "南京",
        children: [
          { value: "xuanwu", label: "玄武区" },
          { value: "gulou", label: "鼓楼区（暂不开放）", disabled: true },
        ],
      },
    ],
  },
];

export default function Demo(): ReactNode {
  return <XhCascaderRoot collection={regions} label="收货地区" placeholder="请选择地区" />;
}
