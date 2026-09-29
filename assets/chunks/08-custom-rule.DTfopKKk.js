const e=`// 作者的准入判定 | accept 与大小数量之外的规矩交给 validate：类型与大小通过之后逐个问它，返回拒绝码即拒收，拒收的文件带着这个码进 file-reject；这里同名文件只收最先到的一份
import type { FileUploadValidateContext } from "@xihan-ui/headless";
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
  return \`\${file.name}-\${file.size}-\${file.lastModified}\`;
}

// 列表里已有同名的，或同一批里排在它前面的有同名的，就报 duplicate
function validate(file: File, context: FileUploadValidateContext): string | null {
  const earlier = context.files.slice(0, context.files.indexOf(file));
  const taken = [...context.acceptedFiles, ...earlier].some(other => other.name === file.name);
  return taken ? "duplicate" : null;
}

export default function Demo(): ReactNode {
  const [dropped, setDropped] = useState("");

  // 拒收的文件与内建原因（类型、大小、数量）走同一条通道，按码挑出自己关心的那一类
  function onFileReject(details: { files: { file: File; reasons: string[] }[] }): void {
    setDropped(details.files
      .filter(rejection => rejection.reasons.includes("duplicate"))
      .map(rejection => rejection.file.name)
      .join("、"));
  }

  return (
    <div style={{ width: "100%", maxWidth: "480px", display: "grid", gap: "12px" }}>
      <XhFileUploadRoot
        maxFiles={6}
        validate={validate}
        onFileReject={onFileReject}
      >
        {({ acceptedFiles }) => (
          <>
            <XhFileUploadLabel>去重后的附件</XhFileUploadLabel>
            <XhFileUploadDropzone>
              <span>同名文件只收最先来的那份</span>
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

      {dropped ? <span>{\`同名挡下：\${dropped}\`}</span> : null}
    </div>
  );
}
`;export{e as default};
