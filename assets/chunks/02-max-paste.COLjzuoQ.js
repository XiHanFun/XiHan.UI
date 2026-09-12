const n=`// 上限与粘贴拆分 | add-on-paste 让粘进来的一串按分隔符拆成多个标签；顶到 max 后再打再粘都进不去
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
      style={{ maxInlineSize: "420px" }}
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
          <span>{\`\${count} / 4\${atMax ? " · 已到上限" : ""}\`}</span>
        </>
      )}
    </XhTagsInputRoot>
  );
}
`;export{n as default};
