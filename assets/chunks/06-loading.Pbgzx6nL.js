const t=`// 加载 | 保留按钮标签并阻止重复操作
import type { ReactNode } from "react";
import { XhButton, XhButtonIndicator, XhButtonLabel } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhButton loading>
        <XhButtonIndicator />
        <XhButtonLabel>提交</XhButtonLabel>
      </XhButton>
      <XhButton loading variant="subtle">
        <XhButtonIndicator />
        <XhButtonLabel>处理中</XhButtonLabel>
      </XhButton>
    </>
  );
}
`;export{t as default};
