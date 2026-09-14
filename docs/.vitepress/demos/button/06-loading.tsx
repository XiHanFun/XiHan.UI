// 加载 | 保留按钮标签并阻止重复操作
import type { ReactNode } from "react";
import { LoaderIcon } from "@xihan-ui/icons";
import { XhButton, XhButtonIndicator, XhButtonLabel, XhIcon } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhButton loading>
        <XhButtonIndicator><XhIcon icon={LoaderIcon} /></XhButtonIndicator>
        <XhButtonLabel>提交</XhButtonLabel>
      </XhButton>
      <XhButton loading variant="subtle">
        <XhButtonIndicator><XhIcon icon={LoaderIcon} /></XhButtonIndicator>
        <XhButtonLabel>处理中</XhButtonLabel>
      </XhButton>
    </>
  );
}
