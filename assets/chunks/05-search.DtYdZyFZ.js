const n=`// 搜索 | 按完整路径筛选选项
import type { ReactNode } from "react";
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderIndicator,
  XhCascaderInput,
  XhCascaderItem,
  XhCascaderItemIndicator,
  XhCascaderItemText,
  XhCascaderLabel,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderSearchList,
  XhCascaderTrigger,
  XhCascaderValueText,
} from "@xihan-ui/react";

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
      { value: "ningbo", label: "宁波", children: [{ value: "haishu", label: "海曙区" }] },
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
  return (
    <XhCascaderRoot
      collection={regions}
      translations={{ noMatch: "未找到匹配的地区" }}
      searchable
      placeholder="试试输入「西湖」或「苏州」"
    >
      {({ levels }) => (
        <>
          <XhCascaderLabel>收货地区</XhCascaderLabel>
          <XhCascaderControl>
            <XhCascaderTrigger>
              <XhCascaderValueText />
              <XhCascaderIndicator />
            </XhCascaderTrigger>
          </XhCascaderControl>
          <XhCascaderPositioner>
            <XhCascaderContent>
              <XhCascaderInput placeholder="搜索地区" />
              <XhCascaderSearchList />
              {levels.map(lv => (
                <XhCascaderColumn key={lv.level} level={lv.level}>
                  {lv.items.map(node => (
                    <XhCascaderItem key={node.value} value={node.value}>
                      <XhCascaderItemText>{node.label}</XhCascaderItemText>
                      <XhCascaderItemIndicator />
                    </XhCascaderItem>
                  ))}
                </XhCascaderColumn>
              ))}
            </XhCascaderContent>
          </XhCascaderPositioner>
        </>
      )}
    </XhCascaderRoot>
  );
}
`;export{n as default};
