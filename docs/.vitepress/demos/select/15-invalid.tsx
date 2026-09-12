// 校验 | 显示无效状态和错误说明
import type { ReactNode } from "react";
import {
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

const departments = [
  { value: "design", label: "设计组" },
  { value: "frontend", label: "前端组" },
  { value: "server", label: "服务端组" },
];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<string[]>([]);
  const invalid = picked.length === 0;

  return (
    <>
      <XhSelectRoot
        value={picked}
        onValueChange={details => setPicked(details.value)}
        invalid={invalid}
        placeholder="必须选一个"
      >
        <XhSelectLabel>所属部门</XhSelectLabel>
        <XhSelectControl>
          <XhSelectTrigger aria-describedby={invalid ? "select-invalid-tip" : undefined}>
            <XhSelectValueText />
            <XhSelectIndicator />
          </XhSelectTrigger>
        </XhSelectControl>
        <XhSelectPositioner>
          <XhSelectContent>
            <XhSelectList>
              {departments.map(d => (
                <XhSelectItem key={d.value} value={d.value}>
                  <XhSelectItemText>{d.label}</XhSelectItemText>
                  <XhSelectItemIndicator />
                </XhSelectItem>
              ))}
            </XhSelectList>
          </XhSelectContent>
        </XhSelectPositioner>
      </XhSelectRoot>
      {invalid
        ? <p id="select-invalid-tip" style={{ color: "var(--xh-fg-danger)" }}>这一项必填</p>
        : null}
    </>
  );
}
