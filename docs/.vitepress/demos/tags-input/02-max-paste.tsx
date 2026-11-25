// 断词符与上限 | delimiter 给一组时其中任何一个都断词：半角逗号、全角逗号、分号都行；add-on-paste 使粘贴进来的一串照它们拆为多个标签，多行清单的换行也算；达到 maxTags 后再输入再粘贴都不能加入
import type { ReactNode } from "react";
import {
  XhTagsInputClearTrigger,
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

// 任何一个都断词；随表单提交的整串用第一个拼接
const delimiters = [",", "，", ";", "\n"];

export default function Demo(): ReactNode {
  const [tags, setTags] = useState<string[]>(["Vue"]);

  return (
    <XhTagsInputRoot
      value={tags}
      onValueChange={details => setTags(details.value)}
      maxTags={4}
      addOnPaste
      delimiter={delimiters}
      placeholder="试试粘贴 React，Svelte;Solid"
    >
      {({ value, count, atMax }) => (
        <>
          <XhTagsInputLabel>技术栈（最多 4 个）</XhTagsInputLabel>
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
            <XhTagsInputClearTrigger />
          </XhTagsInputControl>
          <span data-demo-output>{`${count} / 4${atMax ? " · 已到上限" : ""}`}</span>
        </>
      )}
    </XhTagsInputRoot>
  );
}
