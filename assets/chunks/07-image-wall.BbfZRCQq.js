const e=`// 缩略图墙 | item-preview 是个空方框，作者往里塞什么都行；塞进去的图会被裁成方格，一行摆几张由外层网格定
import type { CSSProperties, ReactNode } from "react";
import {
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadItemPreview,
  XhFileUploadLabel,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/react";
import { useEffect, useRef } from "react";

const wall: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
};

const card = {
  "flexDirection": "column",
  "alignItems": "stretch",
  "--xh-file-upload-preview-size": "96px",
} as CSSProperties;

// key 只收字符串：同名同大小是两份不同的文件，把改动时间也拼进去才分得开
function keyOf(file: File): string {
  return \`\${file.name}-\${file.size}-\${file.lastModified}\`;
}

export default function Demo(): ReactNode {
  // 一个文件一条地址，取过就留着，卸载时统一交还
  const urls = useRef(new Map<File, string>());

  useEffect(() => {
    const cache = urls.current;
    return () => {
      cache.forEach(url => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  function previewUrl(file: File): string {
    const cached = urls.current.get(file);
    if (cached) {
      return cached;
    }
    const url = URL.createObjectURL(file);
    urls.current.set(file, url);
    return url;
  }

  return (
    <div style={{ width: "100%", maxWidth: "480px" }}>
      <XhFileUploadRoot accept="image/*" maxFiles={6}>
        {({ acceptedFiles }) => (
          <>
            <XhFileUploadLabel>相册</XhFileUploadLabel>
            <XhFileUploadDropzone>
              <span>把图片拖进来，最多 6 张</span>
            </XhFileUploadDropzone>
            <div>
              <XhFileUploadTrigger>选择图片</XhFileUploadTrigger>
            </div>
            <XhFileUploadHiddenInput />
            <XhFileUploadList style={wall}>
              {acceptedFiles.map(file => (
                <XhFileUploadItem key={keyOf(file)} file={file} style={card}>
                  <XhFileUploadItemPreview>
                    <img src={previewUrl(file)} alt="" />
                  </XhFileUploadItemPreview>
                  <XhFileUploadItemName />
                  <XhFileUploadItemDeleteTrigger>移除</XhFileUploadItemDeleteTrigger>
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
