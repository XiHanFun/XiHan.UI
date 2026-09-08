// 预置列表 | defaultFiles 给出挂载时就在的那几份，之后列表照旧由组件自己保管，删除与清空都照常
import type { ReactNode } from "react";
import {
  XhFileUploadClearTrigger,
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadItemPreview,
  XhFileUploadItemSizeText,
  XhFileUploadLabel,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/react";

// 预置项就是普通的 File，与用户挑进来的那些没有区别
const initialFiles = [
  new File(["甲方与乙方就本次合作达成如下条款……"], "合同正文.txt", { type: "text/plain" }),
  new File(["# 交付说明\n\n分三批交付。"], "交付说明.md", { type: "text/markdown" }),
];

// key 只收字符串：同名同大小是两份不同的文件，把改动时间也拼进去才分得开
function keyOf(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", maxWidth: "480px" }}>
      <XhFileUploadRoot defaultFiles={initialFiles} maxFiles={4}>
        {({ acceptedFiles }) => (
          <>
            <XhFileUploadLabel>随件资料</XhFileUploadLabel>
            <XhFileUploadDropzone>
              <span>已经带了两份进来</span>
              <span>再拖几份也收，最多 4 份</span>
            </XhFileUploadDropzone>
            <div>
              <XhFileUploadTrigger>继续添加</XhFileUploadTrigger>
            </div>
            <XhFileUploadHiddenInput />
            <XhFileUploadList>
              {acceptedFiles.map(file => (
                <XhFileUploadItem key={keyOf(file)} file={file}>
                  <XhFileUploadItemPreview />
                  <XhFileUploadItemName />
                  <XhFileUploadItemSizeText />
                  <XhFileUploadItemDeleteTrigger />
                </XhFileUploadItem>
              ))}
            </XhFileUploadList>
            <XhFileUploadClearTrigger>清空</XhFileUploadClearTrigger>
          </>
        )}
      </XhFileUploadRoot>
    </div>
  );
}
