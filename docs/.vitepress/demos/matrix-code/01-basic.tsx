// 基础用法 | 给 value 就画码，版本按内容长度自动选；缺省 M 级纠错、4 个模块的静区
import type { ReactNode } from "react";
import { XhMatrixCode } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhMatrixCode value="https://ui.xihanfun.com" />;
}
