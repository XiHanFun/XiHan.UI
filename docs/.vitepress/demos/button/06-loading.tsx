// 加载 | 点击后进入 loading：保留按钮标签，完成前阻止重复操作
import type { ReactNode } from "react";
import { XhButton, XhButtonIndicator, XhButtonLabel } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [loading, setLoading] = useState(false);

  async function save(): Promise<void> {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setLoading(false);
  }

  return (
    <XhButton loading={loading} onClick={save}>
      <XhButtonIndicator />
      <XhButtonLabel>保存</XhButtonLabel>
    </XhButton>
  );
}
