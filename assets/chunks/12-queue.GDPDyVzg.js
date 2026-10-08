var e=`// 并发上限与取消 | max-concurrent-uploads 限定同时在传的份数，多出来的排队依次补上；cancelUpload 只中止传输、文件留在列表里，startUpload 让它重新开传
import type { FileUploadRequest, FileUploadResult, FileUploadStatus } from "@xihan-ui/headless";
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

const statusText: Record<FileUploadStatus, string> = {
  idle: "未开始",
  queued: "排队中",
  uploading: "上传中",
  done: "已传完",
  error: "失败",
  canceled: "已取消",
};

// 演示用的假传输：两秒走完；真实实现把 signal 接给请求库，取消与删除都经它中止
function upload(request: FileUploadRequest): Promise<FileUploadResult> {
  return new Promise((resolve, reject) => {
    let progress = 0;
    const timer = setInterval(() => {
      progress += 10;
      request.onProgress(progress);
      if (progress >= 100) {
        clearInterval(timer);
        resolve({});
      }
    }, 200);
    request.signal.addEventListener("abort", () => {
      clearInterval(timer);
      reject(request.signal.reason);
    });
  });
}

export default function Demo(): ReactNode {
  return (
    <XhFileUploadRoot
      maxFiles={Infinity}
      maxConcurrentUploads={2}
      upload={upload}
      style={{ maxInlineSize: "420px" }}
    >
      {({ acceptedFiles, uploadOf, startUpload, cancelUpload }) => (
        <>
          <XhFileUploadLabel>附件</XhFileUploadLabel>
          <XhFileUploadDropzone>一次多选几份，同时只传两份</XhFileUploadDropzone>
          <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
          <XhFileUploadHiddenInput />
          <XhFileUploadList>
            {acceptedFiles.map((file) => {
              const status = uploadOf(file)?.status ?? "idle";
              return (
                <XhFileUploadItem key={file.name} file={file}>
                  <XhFileUploadItemName />
                  {status === "uploading"
                    ? <XhProgress value={uploadOf(file)?.progress} style={{ flex: 1 }} />
                    : <span style={{ flex: 1 }}>{statusText[status]}</span>}
                  {status === "uploading" || status === "queued"
                    ? <XhButton size="sm" variant="outline" onClick={() => cancelUpload(file)}>取消</XhButton>
                    : null}
                  {status === "canceled"
                    ? <XhButton size="sm" variant="outline" onClick={() => startUpload(file)}>重新上传</XhButton>
                    : null}
                  <XhFileUploadItemDeleteTrigger />
                </XhFileUploadItem>
              );
            })}
          </XhFileUploadList>
        </>
      )}
    </XhFileUploadRoot>
  );
}
`;export{e as default};