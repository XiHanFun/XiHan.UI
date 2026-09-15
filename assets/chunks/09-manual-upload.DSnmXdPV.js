const e=`// 上传生命周期 | 给一个 upload 实现组件就是上传器：收下即开传（auto-upload 可关成手动），进度、成败与返回地址都在每条的传输快照里，失败一键重试
import type { FileUploadRequest, FileUploadResult } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhButton,
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadLabel,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
  XhProgress,
} from "@xihan-ui/react";

// 演示用的假传输：一秒走完，文件名带「坏」字的在半路失败；真实实现把 signal 接给请求库即可
function upload(request: FileUploadRequest): Promise<FileUploadResult> {
  return new Promise((resolve, reject) => {
    let progress = 0;
    const timer = setInterval(() => {
      if (request.signal.aborted) {
        clearInterval(timer);
        reject(new Error("aborted"));
        return;
      }
      progress += 20;
      request.onProgress(progress);
      if (progress >= 60 && request.file.name.includes("坏")) {
        clearInterval(timer);
        reject(new Error("网络中断"));
        return;
      }
      if (progress >= 100) {
        clearInterval(timer);
        resolve({ url: \`https://cdn.example.com/\${request.file.name}\` });
      }
    }, 200);
    request.signal.addEventListener("abort", () => clearInterval(timer));
  });
}

export default function Demo(): ReactNode {
  return (
    <>
      <XhFileUploadRoot
        maxFiles={Infinity}
        upload={upload}
        style={{ maxInlineSize: "420px" }}
      >
        {({ acceptedFiles, uploadOf, startUpload }) => (
          <>
            <XhFileUploadLabel>附件</XhFileUploadLabel>
            <XhFileUploadDropzone>拖进来或点击选择，收下即开传</XhFileUploadDropzone>
            <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
            <XhFileUploadHiddenInput />
            <XhFileUploadList>
              {acceptedFiles.map((file) => {
                const snapshot = uploadOf(file);
                return (
                  <XhFileUploadItem key={file.name} file={file}>
                    <XhFileUploadItemName />
                    {snapshot?.status === "uploading"
                      ? <XhProgress value={snapshot.progress} style={{ flex: 1 }} />
                      : null}
                    {snapshot?.status === "done"
                      ? <span>{\`已传到 \${snapshot.url}\`}</span>
                      : null}
                    {snapshot?.status === "error"
                      ? (
                          <>
                            <span style={{ color: "var(--xh-fg-danger)" }}>失败</span>
                            <XhButton size="sm" variant="outline" onClick={() => startUpload(file)}>重试</XhButton>
                          </>
                        )
                      : null}
                    <XhFileUploadItemDeleteTrigger />
                  </XhFileUploadItem>
                );
              })}
            </XhFileUploadList>
          </>
        )}
      </XhFileUploadRoot>
      <p>试试选一个文件名带「坏」字的文件，看失败与重试。</p>
    </>
  );
}
`;export{e as default};
