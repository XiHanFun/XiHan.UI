// 多选标签 | 内建标签形态：触发器里的标签行最多摆 maxTagCount 枚（缺省 3），其余合成一枚 +N；每枚标签与 +N 都是库里的 tag（语气与尺寸随控件，形态按控件的面派），触发器里纯展示，触发器外配 XhSelectItemDeleteTrigger 即可删
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
  XhSelectOverflowTag,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTag,
  XhSelectTagList,
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
      {({ tags }) => (
        <>
          <XhSelectLabel>技术栈</XhSelectLabel>
          <XhSelectControl>
            <XhSelectTrigger>
              {/* 占位文字与标签行同时写着：有选中时标签行露面、占位让位，无选中时反过来。行里每枚标签与 +N 都是 tag 的 root，样子归 tag.css */}
              <XhSelectValueText />
              <XhSelectTagList>
                {tags.map(t => (
                  <XhSelectTag key={t.value} value={t.value}>{t.label}</XhSelectTag>
                ))}
                <XhSelectOverflowTag />
              </XhSelectTagList>
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
