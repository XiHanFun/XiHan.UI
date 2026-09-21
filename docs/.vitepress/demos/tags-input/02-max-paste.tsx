// 上限与粘贴拆分 | add-on-paste 使粘贴进来的一串按分隔符拆为多个标签；达到 max 后再输入再粘贴都不能加入
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

export default function Demo(): ReactNode {
  const [tags, setTags] = useState<string[]>(["Vue"]);

  return (
    <XhTagsInputRoot
      value={tags}
      onValueChange={details => setTags(details.value)}
      max={4}
      addOnPaste
      delimiter=","
      placeholder="试试粘贴 React,Svelte,Solid"
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
          <span>{`${count} / 4${atMax ? " · 已到上限" : ""}`}</span>
        </>
      )}
    </XhTagsInputRoot>
  );
}
