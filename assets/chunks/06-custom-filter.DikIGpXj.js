var e=`// 拼音首字母搜索 | filter 接管匹配规则：候选是一条完整路径，这里把路径上各段的拼音首字母连起来比，显示名里没有的写法也能搜到
import type { CascaderFilter } from "@xihan-ui/headless";
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

// 每一段的拼音首字母；filter 按值查它，连成整条路径再比
const initials: Record<string, string> = {
  zhejiang: "zj",
  hangzhou: "hz",
  xihu: "xh",
  binjiang: "bj",
  ningbo: "nb",
  haishu: "hs",
  jiangsu: "js",
  nanjing: "nj",
  xuanwu: "xw",
  gulou: "gl",
};

const filter: CascaderFilter = (candidate, query) =>
  candidate.path.map(value => initials[value] ?? "").join("").includes(query.toLowerCase());

export default function Demo(): ReactNode {
  return (
    <XhCascaderRoot
      collection={regions}
      translations={{ noMatch: "未找到匹配的地区" }}
      searchable
      filter={filter}
      placeholder="试试输入「zjhz」或「xh」"
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
              <XhCascaderInput placeholder="输入拼音首字母" />
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
`;export{e as default};