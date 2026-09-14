// 宿主自定的准入 | 组件只管 accept 与大小数量这几条通用规则，别的规矩由宿主在受控列表里再筛一道：这里同名文件只留最先来的那份
import type { ReactNode } from "react";
import {
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
  const [dropped, setDropped] = useState("");
  const [lastAccepted, setLastAccepted] = useState("");

  // 组件报来的是变化之后的完整列表，宿主按自己的规矩决定最终留下哪些
  function onFilesChange(details: { files: File[] }): void {
    const seen = new Set<string>();
    const kept: File[] = [];
    const names: string[] = [];
    for (const file of details.files) {
      if (seen.has(file.name)) {
        names.push(file.name);
        continue;
      }
      seen.add(file.name);
      kept.push(file);
    }
    setFiles(kept);
    setDropped(names.join("、"));
  }

  // 这一批组件收下了谁
  function onFileAccept(details: { files: File[] }): void {
    setLastAccepted(details.files.map(file => file.name).join("、"));
  }

  return (
    <div style={{ width: "100%", maxWidth: "480px", display: "grid", gap: "12px" }}>
      <XhFileUploadRoot
        files={files}
        maxFiles={6}
        onFilesChange={onFilesChange}
        onFileAccept={onFileAccept}
      >
        {({ acceptedFiles }) => (
          <>
            <XhFileUploadLabel>去重后的附件</XhFileUploadLabel>
            <XhFileUploadDropzone>
              <span>同名文件只留最先来的那份</span>
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

      {lastAccepted ? <span>{`这一批收下：${lastAccepted}`}</span> : null}
      {dropped ? <span>{`同名挡下：${dropped}`}</span> : null}
    </div>
  );
}
