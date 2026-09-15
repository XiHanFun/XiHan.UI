// 滑块中的内容 | thumb 是一个普通容器，放置什么由作者决定；容纳空间依靠 --xh-slider-thumb-size 撑开直径
import type { CSSProperties, ReactNode } from "react";
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/react";

const badge: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  blockSize: "100%",
  fontSize: "11px",
  color: "var(--xh-fg-on-brand)",
};

export default function Demo(): ReactNode {
  return (
    <XhSliderRoot
      defaultValue={[45]}
      step={5}
      style={{ "inlineSize": "320px", "--xh-slider-thumb-size": "34px" } as CSSProperties}
    >
      {({ value }) => (
        <>
          <XhSliderLabel>完成度</XhSliderLabel>
          <XhSliderControl>
            <XhSliderTrack>
              <XhSliderRange />
            </XhSliderTrack>
            <XhSliderThumb>
              <span style={badge}>{`${value[0]}%`}</span>
              <XhSliderHiddenInput />
            </XhSliderThumb>
          </XhSliderControl>
        </>
      )}
    </XhSliderRoot>
  );
}
