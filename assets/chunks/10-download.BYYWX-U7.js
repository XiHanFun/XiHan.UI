const e=`// 列表项上的下载 | 条目里放什么由作者定：一条普通的 a[download] 就是下载口；想自己接管就换成按钮，在处理器里怎么取都行
import type { CSSProperties, ReactNode } from "react";
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
import { useEffect, useRef } from "react";

const action: CSSProperties = {
  flex: "none",
  fontSize: "12px",
  color: "var(--xh-fg-brand)",
  cursor: "pointer",
};

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

  function urlOf(file: File): string {
    const cached = urls.current.get(file);
    if (cached) {
      return cached;
    }
    const url = URL.createObjectURL(file);
    urls.current.set(file, url);
    return url;
  }

  // 自己接管下载：这里换了个存盘名，换成签名地址或先取回 blob 也是同一个位置
  function saveCopy(file: File): void {
    const link = document.createElement("a");
    link.href = urlOf(file);
    link.download = \`副本-\${file.name}\`;
    link.click();
  }

  return (
    <div style={{ width: "100%", maxWidth: "520px" }}>
      <XhFileUploadRoot maxFiles={5}>
        {({ acceptedFiles }) => (
          <>
            <XhFileUploadLabel>资料</XhFileUploadLabel>
            <XhFileUploadDropzone>
              <span>放几份文件进来，每条后面就带上下载口</span>
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
                  <a style={action} href={urlOf(file)} download={file.name}>下载</a>
                  <button style={action} type="button" onClick={() => saveCopy(file)}>
                    存为副本
                  </button>
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
