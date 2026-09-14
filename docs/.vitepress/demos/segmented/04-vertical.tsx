// 竖排 | orientation 只改视觉排布，四个方向键与 Home/End 照样都能走
import type { ReactNode } from "react";
import { XhSegmentedRoot } from "@xihan-ui/react";

const densities = [
  { value: "compact", label: "紧凑" },
  { value: "cozy", label: "适中" },
  { value: "comfortable", label: "宽松" },
];

export default function Demo(): ReactNode {
  return (
    <XhSegmentedRoot
      collection={densities}
      orientation="vertical"
      defaultValue="cozy"
      aria-label="行高"
    />
  );
}
