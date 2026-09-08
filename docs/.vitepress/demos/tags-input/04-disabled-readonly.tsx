// 禁用与只读 | disabled 整个控件退出 Tab 序列；read-only 仍可聚焦浏览，但加不进也删不掉
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

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxInlineSize: "420px" }}>
      <XhTagsInputRoot defaultValue={["Vue", "Vite"]} disabled>
        {({ value }) => (
          <>
            <XhTagsInputLabel>禁用</XhTagsInputLabel>
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

      <XhTagsInputRoot defaultValue={["Vue", "Vite"]} readOnly>
        {({ value }) => (
          <>
            <XhTagsInputLabel>只读</XhTagsInputLabel>
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
    </div>
  );
}
