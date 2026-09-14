// 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 outline 只看语气的差别
import type { ReactNode } from "react";
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {tones.map(t => (
        <XhNumberFieldRoot key={t} variant="outline" tone={t} defaultValue="1">
          <XhNumberFieldLabel>{t}</XhNumberFieldLabel>
          <XhNumberFieldControl>
            <XhNumberFieldDecrementTrigger />
            <XhNumberFieldInput />
            <XhNumberFieldIncrementTrigger />
          </XhNumberFieldControl>
        </XhNumberFieldRoot>
      ))}
    </div>
  );
}
