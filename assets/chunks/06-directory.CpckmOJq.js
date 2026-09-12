const e=`// 选整个目录 | directory 让隐藏输入改收目录，选中目录下的文件一次性全进来，数量上限要跟着放开
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

const noLimit = Number.POSITIVE_INFINITY;

// key 只收字符串：同名同大小是两份不同的文件，把改动时间也拼进去才分得开
function keyOf(file: File): string {
  return \`\${file.name}-\${file.size}-\${file.lastModified}\`;
}

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", maxWidth: "480px" }}>
      <XhFileUploadRoot directory maxFiles={noLimit}>
        {({ acceptedFiles, empty }) => (
          <>
            <XhFileUploadLabel>整个目录</XhFileUploadLabel>
            <XhFileUploadDropzone>
              <span>挑一个目录，里面的文件全收</span>
            </XhFileUploadDropzone>
            <div>
              <XhFileUploadTrigger>选择目录</XhFileUploadTrigger>
            </div>
            <XhFileUploadHiddenInput />
            {!empty ? <span>{\`共 \${acceptedFiles.length} 个文件\`}</span> : null}
            <XhFileUploadList style={{ maxBlockSize: "220px", overflow: "auto" }}>
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
    </div>
  );
}
`;export{e as default};
