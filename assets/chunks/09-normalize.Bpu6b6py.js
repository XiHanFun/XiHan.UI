const n=`// 入库前统一改写 | 给了 value 就由宿主说了算：组件只发变更意图，写回什么形状在这里定
import type { ReactNode } from "react";
import {
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
  const [tags, setTags] = useState<string[]>(["#vue"]);

  // 统一成小写并补上井号，重复的那一份丢掉
  function onValueChange(details: { value: string[] }): void {
    const next: string[] = [];
    for (const raw of details.value) {
      const tag = raw.trim().toLowerCase();
      const normalized = tag.startsWith("#") ? tag : \`#\${tag}\`;
      if (normalized !== "#" && !next.includes(normalized)) {
        next.push(normalized);
      }
    }
    setTags(next);
  }

  return (
    <>
      <XhTagsInputRoot
        value={tags}
        onValueChange={onValueChange}
        placeholder="打 Vue 回车，落进去的是 #vue"
        style={{ maxInlineSize: "420px" }}
      >
        {({ value }) => (
          <>
            <XhTagsInputLabel>话题</XhTagsInputLabel>
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
          </>
        )}
      </XhTagsInputRoot>
      <p>{\`当前：\${tags.length ? tags.join("、") : "（无）"}\`}</p>
    </>
  );
}
`;export{n as default};
