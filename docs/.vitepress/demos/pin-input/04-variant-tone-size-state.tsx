// 形态、语气、尺寸与状态 | variant 只改变每格的颜色槽位，tone 决定使用哪族颜色、与 variant 正交，跳格与粘贴铺开的行为各档一致；每格的边长随 size 换档；disabled 使每格都带原生 disabled 且不参与提交，read-only 带原生 readonly、可聚焦可选中复制但不可修改，invalid 只做标注、照常可以修改
import type { ReactNode } from "react";
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/react";

const variants = ["outline", "subtle", "ghost"] as const;
const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
const cells = Array.from({ length: 4 }, (_, i) => i);

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-4)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-5)" }}>
        {variants.map(v => (
          <XhPinInputRoot key={v} variant={v} length={4} placeholder="·">
            <XhPinInputLabel>{v}</XhPinInputLabel>
            {/* 格间距长在格子自己身上，这层包裹只负责排成一行 */}
            <div style={{ display: "flex" }}>
              {cells.map(i => <XhPinInputInput key={i} index={i} />)}
            </div>
          </XhPinInputRoot>
        ))}
      </div>

      {/* 语气这一行固定 outline，只看语气的差别 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-5)" }}>
        {tones.map(t => (
          <XhPinInputRoot
            key={t}
            variant="outline"
            tone={t}
            length={4}
            placeholder="·"
          >
            <XhPinInputLabel>{t}</XhPinInputLabel>
            <div style={{ display: "flex" }}>
              {cells.map(i => <XhPinInputInput key={i} index={i} />)}
            </div>
          </XhPinInputRoot>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "var(--xh-space-5)" }}>
        {sizes.map(s => (
          <XhPinInputRoot key={s.label} size={s.size} length={4} placeholder="·">
            <XhPinInputLabel>{s.label}</XhPinInputLabel>
            <div style={{ display: "flex" }}>
              {cells.map(i => <XhPinInputInput key={i} index={i} />)}
            </div>
          </XhPinInputRoot>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-5)" }}>
        <XhPinInputRoot length={4} defaultValue={["1", "2", "3", "4"]} disabled>
          <XhPinInputLabel>禁用</XhPinInputLabel>
          <div style={{ display: "flex" }}>
            {cells.map(i => <XhPinInputInput key={i} index={i} />)}
          </div>
        </XhPinInputRoot>

        <XhPinInputRoot length={4} defaultValue={["8", "1", "9", "2"]} readOnly>
          <XhPinInputLabel>只读</XhPinInputLabel>
          <div style={{ display: "flex" }}>
            {cells.map(i => <XhPinInputInput key={i} index={i} />)}
          </div>
        </XhPinInputRoot>

        <XhPinInputRoot length={4} defaultValue={["1", "2", "3", "4"]} invalid>
          <XhPinInputLabel>校验失败</XhPinInputLabel>
          <div style={{ display: "flex" }}>
            {cells.map(i => <XhPinInputInput key={i} index={i} />)}
          </div>
        </XhPinInputRoot>
      </div>
    </div>
  );
}
