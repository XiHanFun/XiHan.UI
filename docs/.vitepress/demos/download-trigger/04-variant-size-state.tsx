// 形态、尺寸与状态 | variant 设置触发器外观，size 取小、中、大三档，disabled 禁止触发下载
import type { ActionVariant, Size } from "@xihan-ui/core";
import type { ReactNode } from "react";
import { DownloadIcon } from "@xihan-ui/icons";
import { XhDownloadTrigger, XhIcon } from "@xihan-ui/react";

const variants: { label: string; value: ActionVariant }[] = [
  { label: "实心", value: "solid" },
  { label: "浅色", value: "subtle" },
  { label: "线框", value: "outline" },
  { label: "幽灵", value: "ghost" },
];

const sizes: Size[] = ["sm", "md", "lg"];

const row = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--xh-space-2)" } as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-4)" }}>
      <div style={row}>
        {variants.map(variant => (
          <XhDownloadTrigger key={variant.value} data="XiHan.UI" fileName="xihan-ui.txt" variant={variant.value}>
            <XhIcon icon={DownloadIcon} />
            {" "}
            {variant.label}
          </XhDownloadTrigger>
        ))}
      </div>
      <div style={row}>
        {sizes.map(size => (
          <XhDownloadTrigger key={size} data="XiHan.UI" fileName="xihan-ui.txt" size={size}>
            <XhIcon icon={DownloadIcon} />
            {" "}
            下载文件
          </XhDownloadTrigger>
        ))}
      </div>
      <div style={row}>
        <XhDownloadTrigger disabled data="XiHan.UI" fileName="xihan-ui.txt">
          <XhIcon icon={DownloadIcon} />
          {" "}
          下载文件
        </XhDownloadTrigger>
      </div>
    </div>
  );
}
