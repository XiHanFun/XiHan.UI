const n=`// 异步操作 | 点击后显示加载状态
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
`;export{n as default};
