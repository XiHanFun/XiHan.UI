// 基础用法 | ratio 写宽 ÷ 高：盒宽随容器，高由比例算出，里面的内容铺满整个盒子
import type { CSSProperties, ReactNode } from "react";
import { XhAspectRatio } from "@xihan-ui/react";

const fill = { "--xh-demo-block-block-size": "100%" } as CSSProperties;

export default function Demo(): ReactNode {
  return (
    <XhAspectRatio ratio={16 / 9}>
      <span data-demo-block data-tone="brand" style={fill} />
    </XhAspectRatio>
  );
}
