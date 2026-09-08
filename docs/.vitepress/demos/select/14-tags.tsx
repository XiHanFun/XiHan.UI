// 多选标签 | 内建标签形态：api 的 tags 受 maxTagCount 截断、余数在 overflowCount；触发器里 XhSelectTag 纯展示，触发器外配 XhSelectItemDeleteTrigger 即可删
import type { ReactNode } from "react";
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemDeleteTrigger,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTag,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/react";
import { useState } from "react";

const options = [
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
  { value: "lit", label: "Lit" },
  { value: "preact", label: "Preact" },
];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<string[]>(["vue", "svelte", "solid"]);

  return (
    <XhSelectRoot
      value={picked}
      onValueChange={details => setPicked(details.value)}
      collection={options}
      maxTagCount={2}
      multiple
      placeholder="请选择"
      style={{ inlineSize: "280px" }}
    >
      {({ tags, overflowCount }) => (
        <>
          <XhSelectLabel>技术栈</XhSelectLabel>
          <XhSelectControl>
            <XhSelectTrigger>
              {tags.length === 0
                ? <XhSelectValueText />
                : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      {tags.map(t => (
                        <XhSelectTag key={t.value} value={t.value}>{t.label}</XhSelectTag>
                      ))}
                      {overflowCount > 0
                        ? (
                            <span style={{ color: "var(--xh-fg-muted)", fontSize: "12px" }}>
                              {`+${overflowCount}`}
                            </span>
                          )
                        : null}
                    </span>
                  )}
              <XhSelectIndicator />
            </XhSelectTrigger>
          </XhSelectControl>
          <XhSelectPositioner>
            <XhSelectContent>
              <XhSelectList>
                {options.map(o => (
                  <XhSelectItem key={o.value} value={o.value}>
                    <XhSelectItemText>{o.label}</XhSelectItemText>
                    <XhSelectItemIndicator />
                  </XhSelectItem>
                ))}
              </XhSelectList>
            </XhSelectContent>
          </XhSelectPositioner>
          {/* 触发器外的可删标签行：按钮不能套按钮，删除钮只能放在这里 */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBlockStart: "6px" }}>
            {picked.map(v => (
              <XhSelectTag key={v} value={v}>
                {options.find(o => o.value === v)?.label ?? v}
                <XhSelectItemDeleteTrigger />
              </XhSelectTag>
            ))}
          </div>
        </>
      )}
    </XhSelectRoot>
  );
}
