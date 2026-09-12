// 语气 | tone 换淡底与回退字的配色族；不写 tone 就是中性缺省，直径与字号都不受影响
import type { ReactNode } from "react";
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/react";

const tones = [
  { value: "brand", label: "曦" },
  { value: "neutral", label: "中" },
  { value: "success", label: "成" },
  { value: "warning", label: "警" },
  { value: "danger", label: "危" },
  { value: "info", label: "信" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
      {/* 不写 tone 的那一枚：中性缺省 */}
      <XhAvatarRoot>
        <XhAvatarImage />
        <XhAvatarFallback>XH</XhAvatarFallback>
      </XhAvatarRoot>

      {tones.map(tone => (
        <XhAvatarRoot key={tone.value} tone={tone.value}>
          <XhAvatarImage />
          <XhAvatarFallback>{tone.label}</XhAvatarFallback>
        </XhAvatarRoot>
      ))}
    </div>
  );
}
