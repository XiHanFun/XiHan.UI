// 语气 | 设置按下状态的颜色
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
