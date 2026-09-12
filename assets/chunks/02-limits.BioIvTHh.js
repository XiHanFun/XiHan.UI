const e=`// 限制与拒收 | accept / maxFiles / maxFileSize 越界的当场被拒，file-reject 逐个报出理由
import type { FileUploadFile } from "@xihan-ui/headless";
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
import { useState } from "react";

const reasonText: Record<string, string> = {
  "type": "类型不符",
  "size-too-large": "太大",
  "size-too-small": "太小",
  "too-many-files": "放不下",
};

// 单条删除按钮的可及名字带上文件名，读屏才分得出删的是哪一条
const translations = {
  deleteItem: (file: FileUploadFile) => \`删除 \${file.name}\`,
  clearTrigger: "清空全部",
};

// key 只收字符串：同名同大小是两份不同的文件，把改动时间也拼进去才分得开
function keyOf(file: File): string {
  return \`\${file.name}-\${file.size}-\${file.lastModified}\`;
}

export default function Demo(): ReactNode {
  const [rejected, setRejected] = useState("");

  // 一个文件可能同时命中多条理由
  function onReject(details: { files: { file: File; reasons: string[] }[] }): void {
    setRejected(details.files
      .map(
        it => \`\${it.file.name}（\${it.reasons.map(r => reasonText[r] ?? r).join("、")}）\`,
      )
      .join("；"));
  }

  return (
    <div style={{ width: "100%", maxWidth: "480px", display: "grid", gap: "12px" }}>
      <XhFileUploadRoot
        accept="image/*"
        maxFiles={3}
        maxFileSize={512 * 1024}
        translations={translations}
        onFileReject={onReject}
      >
        {({ acceptedFiles }) => (
          <>
            <XhFileUploadLabel>图片</XhFileUploadLabel>
            <XhFileUploadDropzone>
              <span>只收图片，最多 3 张</span>
              <span>单张不超过 512 KB</span>
            </XhFileUploadDropzone>
            <div>
              <XhFileUploadTrigger>选择图片</XhFileUploadTrigger>
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
            {/* 列表为空时清空按钮照常在位可聚焦，只打 data-empty 由皮肤压淡 */}
            <XhFileUploadClearTrigger>清空</XhFileUploadClearTrigger>
          </>
        )}
      </XhFileUploadRoot>
      {rejected ? <span>{\`被拒：\${rejected}\`}</span> : null}
    </div>
  );
}
`;export{e as default};
