// 基础用法 | 框里打字按 Enter 落一个标签；标签由作者按当前值渲染，每个标签自带 value 标识身份，预览与删除钮就是库里的 tag
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
  const [tags, setTags] = useState<string[]>(["Vue", "TypeScript"]);

  return (
    <>
      <XhTagsInputRoot
        value={tags}
        onValueChange={details => setTags(details.value)}
        placeholder="回车落一个"
        style={{ maxInlineSize: "420px" }}
      >
        {({ value }) => (
          <>
            <XhTagsInputLabel>技术栈</XhTagsInputLabel>
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
      <p>{`当前：${tags.length ? tags.join("、") : "（无）"}`}</p>
    </>
  );
}
