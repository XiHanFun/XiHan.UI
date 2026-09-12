// 失败要说出来 | 取数抛出或拒绝都会退回 idle 并派 download-error，按钮不会一直停在"下载中"
import type { DownloadTriggerErrorDetails } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhDownloadTrigger } from "@xihan-ui/react";
import { useState } from "react";

function failingData(): Promise<string> {
  return Promise.reject(new Error("导出接口没响应"));
}

export default function Demo(): ReactNode {
  const [message, setMessage] = useState("还没试过");

  function onError(details: DownloadTriggerErrorDetails): void {
    setMessage(`下载失败：${(details.error as Error).message}`);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <XhDownloadTrigger
        data={failingData}
        fileName="report.csv"
        onDownloadError={onError}
      >
        导出报表（必失败）
      </XhDownloadTrigger>
      <span style={{ fontSize: "13px" }}>{message}</span>
    </div>
  );
}
