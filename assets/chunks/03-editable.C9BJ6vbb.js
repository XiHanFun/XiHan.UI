const n=`// 就地编辑 | editable 打开后双击任一标签改写它：Enter 提交、Escape 撤销，改成空白等于删掉这个标签
import type { ReactNode } from "react";
import {
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemInput,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [tags, setTags] = useState<string[]>(["前端", "组件库", "无障碍"]);

  return (
    <>
      <XhTagsInputRoot
        value={tags}
        onValueChange={details => setTags(details.value)}
        editable
        placeholder="回车落一个"
        style={{ maxInlineSize: "420px" }}
      >
        {({ value }) => (
          <>
            <XhTagsInputLabel>标签</XhTagsInputLabel>
            <XhTagsInputControl>
              {value.map(t => (
                <XhTagsInputItem key={t} value={t}>
                  <XhTagsInputItemPreview>
                    <XhTagsInputItemText>{t}</XhTagsInputItemText>
                    <XhTagsInputItemDeleteTrigger />
                  </XhTagsInputItemPreview>
                  {/* 编辑框常挂不卸载，不编辑时由组件收起 */}
                  <XhTagsInputItemInput />
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
