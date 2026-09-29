const e=`// 头部下载 | 下载交给下载触发器：放进头部条，文件名沿用代码的文件名，写出的是原文
import type { ReactNode } from "react";
import { DownloadIcon } from "@xihan-ui/icons";
import {
  XhCodeViewCode,
  XhCodeViewFilename,
  XhCodeViewHeader,
  XhCodeViewPre,
  XhCodeViewRoot,
  XhDownloadTrigger,
  XhIcon,
} from "@xihan-ui/react";

const filename = "retry.ts";
const sample = \`export async function retry<T>(run: () => Promise<T>, times = 3): Promise<T> {
  let last: unknown
  for (let i = 0; i < times; i++) {
    try {
      return await run()
    }
    catch (error) {
      last = error
    }
  }
  throw last
}\`;

export default function Demo(): ReactNode {
  return (
    <XhCodeViewRoot code={sample} lang="typescript" filename={filename} complete style={{ inlineSize: "100%" }}>
      <XhCodeViewHeader>
        {/* 文件名占满剩余宽度，下载按钮自然被推到头部条末端 */}
        <XhCodeViewFilename />
        <XhDownloadTrigger data={sample} fileName={filename} variant="ghost" size="sm">
          <XhIcon icon={DownloadIcon} />
          {" "}
          下载
        </XhDownloadTrigger>
      </XhCodeViewHeader>
      <XhCodeViewPre>
        <XhCodeViewCode />
      </XhCodeViewPre>
    </XhCodeViewRoot>
  );
}
`;export{e as default};
