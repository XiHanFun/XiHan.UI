// 形态 | 默认渐隐弧，另有 ring 整圈与 dots 三点
import type { ReactNode } from "react";
import { XhSpinner } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhSpinner label="加载中" />
      <XhSpinner variant="ring" label="加载中" />
      <XhSpinner variant="dots" label="加载中" />
    </>
  );
}
