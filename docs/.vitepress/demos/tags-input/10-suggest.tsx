// 候选词一键添加 | 根插槽给出 addValue 与 atMax：输入框之外再开一条加标签的路，上限一样管得住
import type { ReactNode } from "react";
import {
  XhButton,
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const suggestions = ["文档", "无障碍", "设计令牌", "组件库"];

export default function Demo(): ReactNode {
  const [tags, setTags] = useState<string[]>(["文档"]);

  return (
    <XhTagsInputRoot
      value={tags}
      onValueChange={details => setTags(details.value)}
      max={3}
      placeholder="回车落一个"
      style={{ maxInlineSize: "420px" }}
    >
      {({ value, addValue, atMax }) => (
        <>
          <XhTagsInputLabel>话题（最多 3 个）</XhTagsInputLabel>
          <XhTagsInputControl>
            {value.map(t => (
              <XhTagsInputItem key={t} value={t}>
                <XhTagsInputItemPreview>
                  <XhTagsInputItemText>{t}</XhTagsInputItemText>
                  <XhTagsInputItemDeleteTrigger />
                </XhTagsInputItemPreview>
              </XhTagsInputItem>
            ))}
            <XhTagsInputInput />
          </XhTagsInputControl>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {suggestions.map(s => (
              <XhButton
                key={s}
                size="sm"
                variant="outline"
                disabled={atMax || value.includes(s)}
                onClick={() => addValue(s)}
              >
                {s}
              </XhButton>
            ))}
          </div>
        </>
      )}
    </XhTagsInputRoot>
  );
}
