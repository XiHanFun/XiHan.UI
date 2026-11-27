// 基础用法 | 只写根组件就按标准结构铺出标题、轨道与拇指；值恒为数组，单滑块即长度 1；方向键移动一格 step，PageUp 与 PageDown 按 largeStep，Home 与 End 到达端点
import type { ReactNode } from "react";
import { XhSliderRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhSliderRoot label="音量" defaultValue={[40]} largeStep={10} name="volume" style={{ inlineSize: "320px" }} />;
}
