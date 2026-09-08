// 条目自定义内容 | 条目里放什么由作者定：文本后面加一段附加信息，分支箭头由皮肤自动画
import type { ReactNode } from "react";
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderIndicator,
  XhCascaderItem,
  XhCascaderItemIndicator,
  XhCascaderItemText,
  XhCascaderLabel,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhCascaderValueText,
} from "@xihan-ui/react";
import { useState } from "react";

const org = [
  {
    value: "product",
    label: "产品线",
    children: [
      { value: "design", label: "设计组" },
      { value: "research", label: "用研组" },
    ],
  },
  {
    value: "tech",
    label: "技术线",
    children: [
      { value: "web", label: "前端组" },
      { value: "server", label: "服务端组" },
    ],
  },
];

// 条目上的附加信息由作者自己按值查，组件只管值与层级
const headcount: Record<string, number> = {
  product: 18,
  design: 11,
  research: 7,
  tech: 32,
  web: 14,
  server: 18,
};

export default function Demo(): ReactNode {
  const [dept, setDept] = useState<string[][]>([]);

  return (
    <>
      <XhCascaderRoot
        value={dept}
        onValueChange={details => setDept(details.value)}
        collection={org}
        placeholder="请选择团队"
      >
        {({ levels }) => (
          <>
            <XhCascaderLabel>团队</XhCascaderLabel>
            <XhCascaderControl>
              <XhCascaderTrigger>
                <XhCascaderValueText />
                <XhCascaderIndicator />
              </XhCascaderTrigger>
            </XhCascaderControl>
            <XhCascaderPositioner>
              <XhCascaderContent>
                {levels.map(lv => (
                  <XhCascaderColumn key={lv.level} level={lv.level}>
                    {lv.items.map(node => (
                      <XhCascaderItem key={node.value} value={node.value}>
                        <XhCascaderItemText>{node.label}</XhCascaderItemText>
                        <span style={{ flex: "none", color: "var(--xh-fg-subtle)", fontSize: "12px" }}>
                          {`${headcount[node.value]} 人`}
                        </span>
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
      <p>{`当前团队：${dept[0]?.join(" / ") ?? "（未选）"}`}</p>
    </>
  );
}
