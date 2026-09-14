// 补充说明 | description 提供一行简短上下文；需要长时间阅读的内容改用 Notification
import type { ReactNode } from "react";
import {
  XhToastCloseTrigger,
  XhToastContent,
  XhToastDescription,
  XhToastIndicator,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhToastRoot
      type="success"
      title="文件已上传"
      description="可在项目资源中继续查看"
      duration={0}
      translations={{ close: "关闭" }}
    >
      <XhToastIndicator />
      <XhToastContent>
        <XhToastTitle />
        <XhToastDescription />
      </XhToastContent>
      <XhToastCloseTrigger />
    </XhToastRoot>
  );
}
