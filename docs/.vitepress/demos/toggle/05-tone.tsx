// 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 solid 形态并置于按下态，语气差别最明显
import type { ReactNode } from "react";
import { XhToggle } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <>
      {tones.map(t => (
        <XhToggle key={t} variant="solid" tone={t} defaultPressed>{t}</XhToggle>
      ))}
    </>
  );
}
