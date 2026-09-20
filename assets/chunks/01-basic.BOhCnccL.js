const t=`// 基础用法 | 默认由状态图标、文本列和悬停显示的关闭按钮组成；duration 设为 0 即不自动消失
import type { ReactNode } from "react";
import {
  XhButton,
  XhToastCloseTrigger,
  XhToastContent,
  XhToastIndicator,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  // 关掉之后换一个 key 重新挂一条，方便反复看
  const [seq, setSeq] = useState(0);

  return (
    <div style={{ display: "grid", width: "100%", gap: "12px", justifyItems: "center" }}>
      <XhToastRoot
        key={seq}
        title="草稿已保存"
        duration={0}
        translations={{ close: "关闭" }}
      >
        <XhToastIndicator />
        <XhToastContent><XhToastTitle /></XhToastContent>
        <XhToastCloseTrigger />
      </XhToastRoot>
      <XhButton size="sm" variant="outline" onClick={() => setSeq(seq + 1)}>再挂一条</XhButton>
    </div>
  );
}
`;export{t as default};
