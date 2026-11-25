// 多选 | 已选项在触发器里排成标签，超出 max-tag-count 的合并为 +N；按钮不能套按钮，带删除钮的标签只能排在触发器外
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

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "blueberry", label: "蓝莓" },
  { value: "durian", label: "榴莲" },
];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<string[]>(["apple", "banana", "blueberry"]);

  return (
    <>
      <XhSelectRoot
        value={picked}
        onValueChange={details => setPicked(details.value)}
        collection={fruits}
        maxTagCount={2}
        multiple
        placeholder="请选择"
      >
        {({ tags }) => (
          <>
            <XhSelectLabel>水果（多选）</XhSelectLabel>
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
                  {fruits.map(f => (
                    <XhSelectItem key={f.value} value={f.value}>
                      <XhSelectItemText>{f.label}</XhSelectItemText>
                      <XhSelectItemIndicator />
                    </XhSelectItem>
                  ))}
                </XhSelectList>
              </XhSelectContent>
            </XhSelectPositioner>
            {/* 触发器外的可删标签行：按钮不能套按钮，删除钮只能放在这里 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-1)", marginBlockStart: "var(--xh-space-2)" }}>
              {picked.map(v => (
                <XhSelectTag key={v} value={v}>
                  {fruits.find(f => f.value === v)?.label ?? v}
                  <XhSelectItemDeleteTrigger />
                </XhSelectTag>
              ))}
            </div>
          </>
        )}
      </XhSelectRoot>
      <p data-demo-output>
        已选：
        {picked.length ? picked.join("、") : "（无）"}
      </p>
    </>
  );
}
