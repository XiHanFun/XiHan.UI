// 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，语气的底色差别不必聚焦就看得见
import type { ReactNode } from "react";
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <>
      {/* 框里的字不归语气管，语气只落在底色、悬停描边与聚焦描边上；聚焦环恒用同一族色 */}
      {tones.map(t => (
        <XhPasswordInputRoot
          key={t}
          variant="subtle"
          tone={t}
          defaultValue="hunter2"
        >
          <XhPasswordInputLabel>{t}</XhPasswordInputLabel>
          <XhPasswordInputControl>
            <XhPasswordInputInput style={{ inlineSize: "160px" }} />
            <XhPasswordInputVisibilityTrigger>○</XhPasswordInputVisibilityTrigger>
          </XhPasswordInputControl>
        </XhPasswordInputRoot>
      ))}
    </>
  );
}
