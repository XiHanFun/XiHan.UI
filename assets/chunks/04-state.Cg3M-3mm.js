const t=`// 禁用与载入 | loading 会挡住点击，并给 indicator 部件挂上旋转动画
import type { ReactNode } from "react";
import { XhButton, XhButtonIndicator, XhButtonLabel } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhButton disabled>禁用</XhButton>
      <XhButton loading>
        <XhButtonIndicator />
        <XhButtonLabel>提交中</XhButtonLabel>
      </XhButton>
    </>
  );
}
`;export{t as default};
