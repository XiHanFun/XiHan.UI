// 基础用法 | 一条一句话：title 部件留空时由属性上的文案填入；duration 给 0 即不自动消失
import type { ReactNode } from "react";
import {
  XhButton,
  XhToastCloseTrigger,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  // 关掉之后换一个 key 重新挂一条，方便反复看
  const [seq, setSeq] = useState(0);

  return (
    <div style={{ display: "grid", gap: "12px", justifyItems: "start" }}>
      <XhToastRoot
        key={seq}
        title="草稿已保存"
        duration={0}
        translations={{ close: "关闭" }}
      >
        <XhToastTitle />
        <XhToastCloseTrigger />
      </XhToastRoot>
      <XhButton size="sm" variant="outline" onClick={() => setSeq(seq + 1)}>再挂一条</XhButton>
    </div>
  );
}
