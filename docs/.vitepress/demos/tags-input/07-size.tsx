// 尺寸 | 控件高度、胶囊与输入文字一起换档，不传 size 即默认档
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

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxInlineSize: "420px" }}>
      {sizes.map(s => (
        <XhTagsInputRoot
          key={s.label}
          size={s.size}
          defaultValue={["Vue", "TypeScript"]}
          placeholder="回车落一个"
        >
          {({ value }) => (
            <>
              <XhTagsInputLabel>{s.label}</XhTagsInputLabel>
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
      ))}
    </div>
  );
}
