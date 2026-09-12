const n=`// Blob 内容 | 结构化与二进制内容交 Blob，它自带的类型就是写出去的类型；显式写了 mime-type 则以 mime-type 为准
import type { ReactNode } from "react";
import { XhDownloadTrigger } from "@xihan-ui/react";

function makeProfile(): Blob {
  const profile = { name: "曦寒 UI", version: "1.0.0", locale: "zh-CN" };
  return new Blob([JSON.stringify(profile, null, 2)], {
    type: "application/json",
  });
}

export default function Demo(): ReactNode {
  return (
    <XhDownloadTrigger data={makeProfile} fileName="profile.json">
      导出配置
    </XhDownloadTrigger>
  );
}
`;export{n as default};
