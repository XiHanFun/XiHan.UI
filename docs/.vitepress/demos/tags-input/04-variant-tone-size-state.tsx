// 形态、语气、尺寸与状态 | variant 只改变控件的颜色槽位，标签形态按控件的面派生（subtle 中是描边标签，其余是淡底标签）；tone 与 variant 正交；size 让控件高度、胶囊与输入文字一起换档；disabled 整个控件退出 Tab 序列、标签一起置灰，read-only 仍可聚焦浏览但不能加入也不能删除、标签不置灰
import type { CSSProperties, ReactNode } from "react";
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

const variants = ["outline", "subtle", "ghost"] as const;

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

const columnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--xh-space-5)",
  maxInlineSize: "420px",
};

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-8)" }}>
      <div style={columnStyle}>
        {variants.map(v => (
          <XhTagsInputRoot
            key={v}
            variant={v}
            defaultValue={["Vue", "TypeScript"]}
            placeholder="回车落一个"
          >
            {({ value }) => (
              <>
                <XhTagsInputLabel>{v}</XhTagsInputLabel>
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

      <div style={{ display: "grid", gap: "var(--xh-space-4)", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
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

      <div style={columnStyle}>
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

      <div style={columnStyle}>
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
    </div>
  );
}
