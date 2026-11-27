// 基础用法 | 只写根组件就按标准结构铺出标题、投放区与文件列表；投放区本身就是打开文件选择的按钮，拖进来的文件同样收下
import type { ReactNode } from "react";
import { XhFileUploadRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", maxWidth: 480 }}>
      <XhFileUploadRoot label="附件" />
    </div>
  );
}
