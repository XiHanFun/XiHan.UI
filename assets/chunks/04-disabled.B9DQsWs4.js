const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 禁用 | disabled 把投放区、触发器与隐藏输入一并关停，拖拽进来也不再收
import type { ReactNode } from "react";
import {
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadLabel,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", maxWidth: "480px" }}>
      <XhFileUploadRoot disabled>
        <XhFileUploadLabel>附件</XhFileUploadLabel>
        <XhFileUploadDropzone>
          <span>当前不接受上传</span>
        </XhFileUploadDropzone>
        <div>
          <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
        </div>
        <XhFileUploadHiddenInput />
      </XhFileUploadRoot>
    </div>
  );
}
`;export{n as default};
