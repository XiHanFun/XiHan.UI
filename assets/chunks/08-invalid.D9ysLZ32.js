const e=`// 校验状态 | invalid 让 trigger 报 aria-invalid、描边换成错误色；浮层照常展开，判定归宿主，这里是没选就报错
import type { ReactNode } from "react";
import {
  XhCascaderClearTrigger,
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

const departments = [
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

export default function Demo(): ReactNode {
  const [dept, setDept] = useState<string[][]>([]);
  // 校验归宿主，组件只负责把这个结论铺成属性
  const invalid = dept.length === 0;

  return (
    <>
      <XhCascaderRoot
        value={dept}
        onValueChange={details => setDept(details.value)}
        collection={departments}
        invalid={invalid}
        placeholder="请选到具体的组"
      >
        {({ levels }) => (
          <>
            <XhCascaderLabel>所属部门</XhCascaderLabel>
            <XhCascaderControl>
              <XhCascaderTrigger>
                <XhCascaderValueText />
                <XhCascaderIndicator />
              </XhCascaderTrigger>
              <XhCascaderClearTrigger />
            </XhCascaderControl>
            <XhCascaderPositioner>
              <XhCascaderContent>
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
      {invalid && <p style={{ color: "var(--xh-fg-danger)" }}>这一项必填</p>}
    </>
  );
}
`;export{e as default};
