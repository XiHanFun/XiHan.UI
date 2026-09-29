const e=`// 反向 | inverted 把 min 放到轨道末端，已选区间从末端画起；竖排时 0 米在上、越往下越深，方向键跟随屏幕方向
import type { ReactNode } from "react";
import {
  XhSliderControl,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhSliderRoot defaultValue={[18]} min={0} max={40} orientation="vertical" inverted>
      <XhSliderLabel>潜水深度（米）</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderThumb />
      </XhSliderControl>
    </XhSliderRoot>
  );
}
`;export{e as default};
