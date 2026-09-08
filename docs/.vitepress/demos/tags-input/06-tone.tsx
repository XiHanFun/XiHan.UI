// 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 outline 只看语气的差别
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

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
      {tones.map(t => (
        <XhTagsInputRoot
          key={t}
          variant="outline"
          tone={t}
          defaultValue={["标签"]}
          placeholder="回车落一个"
        >
          {({ value }) => (
            <>
              <XhTagsInputLabel>{t}</XhTagsInputLabel>
              <XhTagsInputControl>
                {value.map(v => (
                  <XhTagsInputItem key={v} value={v}>
                    <XhTagsInputItemPreview>
                      <XhTagsInputItemText>{v}</XhTagsInputItemText>
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
