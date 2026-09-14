// 图标 | 在文字前后放置图标
import type { ReactNode } from "react";
import { ArrowRightIcon, PlusIcon } from "@xihan-ui/icons";
import { XhButton, XhButtonLabel, XhButtonPrefix, XhButtonSuffix, XhIcon } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhButton>
        <XhButtonPrefix><XhIcon icon={PlusIcon} /></XhButtonPrefix>
        <XhButtonLabel>新建项目</XhButtonLabel>
      </XhButton>
      <XhButton variant="subtle">
        <XhButtonLabel>下一步</XhButtonLabel>
        <XhButtonSuffix><XhIcon icon={ArrowRightIcon} /></XhButtonSuffix>
      </XhButton>
    </>
  );
}
