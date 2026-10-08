var e=`// 缓冲 | buffer 在填充之后画第二段浅色填充，表示已经就绪、还没用到的那一截，如视频已缓冲到的位置
import type { ReactNode } from "react";
import { XhProgress } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhProgress value={30} buffer={65} valueText="已播放 30%" aria-label="播放进度" style={{ width: "100%" }} />
  );
}
`;export{e as default};