const e=`// 命令式聚焦与展开 | trigger 部件就是原生按钮，拿到它即可 focus / blur；开合交给宿主写 open
import type { ReactNode } from "react";
import {
  XhButton,
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
import { useRef, useState } from "react";

const regions = [
  {
    value: "zhejiang",
    label: "浙江",
    children: [
      { value: "hangzhou", label: "杭州" },
      { value: "ningbo", label: "宁波" },
    ],
  },
  {
    value: "jiangsu",
    label: "江苏",
    children: [{ value: "nanjing", label: "南京" }],
  },
];

export default function Demo(): ReactNode {
  // trigger 部件渲染的就是那个按钮，ref 直接落在元素上
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [area, setArea] = useState<string[][]>([]);

  return (
    <XhCascaderRoot
      value={area}
      onValueChange={details => setArea(details.value)}
      collection={regions}
      placeholder="请选择地区"
    >
      {({ levels, open, setOpen }) => (
        <>
          <XhCascaderLabel>收货地区</XhCascaderLabel>
          <XhCascaderControl>
            <XhCascaderTrigger ref={trigger}>
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
                      <XhCascaderItemIndicator />
                    </XhCascaderItem>
                  ))}
                </XhCascaderColumn>
              ))}
            </XhCascaderContent>
          </XhCascaderPositioner>
          <div style={{ display: "flex", gap: "8px", marginBlockStart: "12px" }}>
            <XhButton size="sm" variant="outline" onClick={() => trigger.current?.focus()}>
              聚焦
            </XhButton>
            <XhButton size="sm" variant="outline" onClick={() => trigger.current?.blur()}>
              失焦
            </XhButton>
            <XhButton size="sm" variant="outline" onClick={() => setOpen(!open)}>
              {open ? "收起" : "展开"}
            </XhButton>
          </div>
        </>
      )}
    </XhCascaderRoot>
  );
}
`;export{e as default};
