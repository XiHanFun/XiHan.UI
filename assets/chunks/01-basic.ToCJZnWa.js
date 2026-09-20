const e=`// 基础用法 | 代码原文由宿主提供，组件切出逐行结构并铺设记号；渲染文件名后它即成为代码块的可访问名
import type { ReactNode } from "react";
import {
  XhCodeViewCode,
  XhCodeViewFilename,
  XhCodeViewHeader,
  XhCodeViewLangLabel,
  XhCodeViewPre,
  XhCodeViewRoot,
} from "@xihan-ui/react";

const sample = \`export function createTicker(intervalTime: number) {
  let handle = 0
  return {
    start(onTick: () => void) {
      handle = setInterval(onTick, intervalTime)
    },
    stop() {
      clearInterval(handle)
    },
  }
}\`;

export default function Demo(): ReactNode {
  return (
    // complete 表示这段代码已经写完，可以放心着色
    <XhCodeViewRoot
      code={sample}
      lang="typescript"
      filename="ticker.ts"
      complete
      style={{ inlineSize: "100%" }}
    >
      <XhCodeViewHeader>
        <XhCodeViewFilename />
        <XhCodeViewLangLabel />
      </XhCodeViewHeader>
      <XhCodeViewPre>
        <XhCodeViewCode />
      </XhCodeViewPre>
    </XhCodeViewRoot>
  );
}
`;export{e as default};
