// 清空按钮 | 清空钮是触发器的兄弟节点，一起收在盒里并排（Vue 的 collection 自动渲染加 clearable 即带上它）；有选中才出现、出现即顶替下拉箭头，不占 Tab 位（键盘清空走 Delete / Backspace）；点按清空全部选中、不展开浮层，焦点回到触发器；可及名走 translations.clearTrigger
import type { ReactNode } from "react";
import {
  XhSelectClearTrigger,
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/react";
import { useState } from "react";

const teams = [
  { value: "design", label: "设计组" },
  { value: "frontend", label: "前端组" },
  { value: "server", label: "服务端组" },
];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<string[]>(["design"]);
  const [auto, setAuto] = useState<string[]>(["frontend"]);

  return (
    <>
      <XhSelectRoot
        value={picked}
        onValueChange={details => setPicked(details.value)}
        translations={{ clearTrigger: "清空所选" }}
        placeholder="选一个组"
        style={{ inlineSize: "240px" }}
      >
        <XhSelectLabel>所属小组</XhSelectLabel>
        <XhSelectControl>
          <XhSelectTrigger>
            <XhSelectValueText />
            <XhSelectIndicator />
          </XhSelectTrigger>
          <XhSelectClearTrigger />
        </XhSelectControl>
        <XhSelectPositioner>
          <XhSelectContent>
            <XhSelectList>
              {teams.map(t => (
                <XhSelectItem key={t.value} value={t.value}>
                  <XhSelectItemText>{t.label}</XhSelectItemText>
                  <XhSelectItemIndicator />
                </XhSelectItem>
              ))}
            </XhSelectList>
          </XhSelectContent>
        </XhSelectPositioner>
      </XhSelectRoot>
      <p style={{ margin: "8px 0 0", fontSize: "13px" }}>
        {`选中：${picked.length ? picked.join(", ") : "（空）"}`}
      </p>
      <XhSelectRoot
        value={auto}
        onValueChange={details => setAuto(details.value)}
        collection={teams}
        translations={{ clearTrigger: "清空所选" }}
        clearable
        label="所属小组（自动渲染）"
        placeholder="选一个组"
        style={{ marginTop: "16px", inlineSize: "240px" }}
      />
      <p style={{ margin: "8px 0 0", fontSize: "13px" }}>
        {`选中：${auto.length ? auto.join(", ") : "（空）"}`}
      </p>
    </>
  );
}
