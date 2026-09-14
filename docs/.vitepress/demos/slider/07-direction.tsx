// 文字方向 | dir 换成 rtl 后轨道从右往左填，左右两键的语义跟着对调；上下键与 Home、End 不受影响
import type { ReactNode } from "react";
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <XhSliderRoot defaultValue={[35]} style={{ inlineSize: "280px" }}>
        {({ value }) => (
          <>
            <XhSliderLabel>{`从左往右：${value[0]}`}</XhSliderLabel>
            <XhSliderControl>
              <XhSliderTrack>
                <XhSliderRange />
              </XhSliderTrack>
              <XhSliderThumb>
                <XhSliderHiddenInput />
              </XhSliderThumb>
            </XhSliderControl>
          </>
        )}
      </XhSliderRoot>

      {/* 外层节点声明文字方向，轨道与滑块用的逻辑属性据此换向 */}
      <div dir="rtl">
        <XhSliderRoot dir="rtl" defaultValue={[35]} style={{ inlineSize: "280px" }}>
          {({ value }) => (
            <>
              <XhSliderLabel>{`从右往左：${value[0]}`}</XhSliderLabel>
              <XhSliderControl>
                <XhSliderTrack>
                  <XhSliderRange />
                </XhSliderTrack>
                <XhSliderThumb>
                  <XhSliderHiddenInput />
                </XhSliderThumb>
              </XhSliderControl>
            </>
          )}
        </XhSliderRoot>
      </div>
    </div>
  );
}
