// 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，语气的底色差别不必聚焦就看得见
import type { ReactNode } from "react";
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <>
      {/* 正文颜色不归语气管，语气只落在底色、悬停描边与聚焦环上 */}
      {tones.map(t => (
        <XhTextFieldRoot key={t} variant="subtle" tone={t} placeholder="点进来看聚焦环">
          <XhTextFieldLabel>{t}</XhTextFieldLabel>
          <XhTextFieldControl style={{ inlineSize: "160px" }}>
            <XhTextFieldInput />
          </XhTextFieldControl>
        </XhTextFieldRoot>
      ))}
    </>
  );
}
