var e=`// 一组断词符 | delimiter 给一组时其中任何一个都断词：半角逗号、全角逗号、分号都行，粘贴多行清单时换行也算；随表单提交的整串用第一个拼接
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

const delimiters = [",", "，", ";", "\\n"];

export default function Demo(): ReactNode {
  return (
    <XhTagsInputRoot
      delimiter={delimiters}
      addOnPaste
      placeholder="试试输入 北京，上海;广州"
      style={{ maxInlineSize: "420px" }}
    >
      {({ value }) => (
        <>
          <XhTagsInputLabel>城市</XhTagsInputLabel>
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
  );
}
`;export{e as default};