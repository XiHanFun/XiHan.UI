// 基础用法 | 提供 value 即绘制码，默认 Code 128，接受任意 ASCII；人读文字印在条下
import type { ReactNode } from "react";
import { XhBarCode } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhBarCode value="XH-2026-0915" />;
}
