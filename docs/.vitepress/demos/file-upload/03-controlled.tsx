// 受控 | 传了 files 就由宿主说了算，组件自己不再落值，只发 files-change 报告意图
import type { ReactNode } from "react";
import {
  XhButton,
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadItemSizeText,
  XhFileUploadLabel,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

// key 只收字符串：同名同大小是两份不同的文件，把改动时间也拼进去才分得开
function keyOf(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function Demo(): ReactNode {
  const [files, setFiles] = useState<File[]>([]);

  // 变化之后的完整列表，不是增量
  function onFilesChange(details: { files: File[] }): void {
    setFiles(details.files);
  }

  return (
    <div style={{ width: "100%", maxWidth: "480px", display: "grid", gap: "12px" }}>
      <XhFileUploadRoot files={files} maxFiles={5} onFilesChange={onFilesChange}>
        {({ acceptedFiles }) => (
          <>
            <XhFileUploadLabel>受控列表</XhFileUploadLabel>
            <XhFileUploadDropzone>
              <span>选进来的文件由外部数组保管</span>
            </XhFileUploadDropzone>
            <div>
              <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
            </div>
            <XhFileUploadHiddenInput />
            <XhFileUploadList>
              {acceptedFiles.map(file => (
                <XhFileUploadItem key={keyOf(file)} file={file}>
                  <XhFileUploadItemName />
                  <XhFileUploadItemSizeText />
                  <XhFileUploadItemDeleteTrigger />
                </XhFileUploadItem>
              ))}
            </XhFileUploadList>
          </>
        )}
      </XhFileUploadRoot>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <XhButton size="sm" disabled={!files.length} onClick={() => setFiles([])}>
          从外面清空
        </XhButton>
        <span>{`宿主持有 ${files.length} 个文件`}</span>
      </div>
    </div>
  );
}
