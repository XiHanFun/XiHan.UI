const e=`// 基础用法 | 投放区自己就是一个大按钮，隐藏输入是必备部件，缺了它选不了文件
import type { ReactNode } from "react";
import {
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

// key 只收字符串：同名同大小是两份不同的文件，把改动时间也拼进去才分得开
function keyOf(file: File): string {
  return \`\${file.name}-\${file.size}-\${file.lastModified}\`;
}

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", maxWidth: "480px" }}>
      <XhFileUploadRoot>
        {({ acceptedFiles }) => (
          <>
            <XhFileUploadLabel>附件</XhFileUploadLabel>
            <XhFileUploadDropzone>
              <span>把文件拖到这里</span>
              <span>或者用下面的按钮挑一个</span>
            </XhFileUploadDropzone>
            <div>
              <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
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
          </>
        )}
      </XhFileUploadRoot>
    </div>
  );
}
`;export{e as default};
