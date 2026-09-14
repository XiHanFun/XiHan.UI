// 变体 | 设置触发器外观
import type { ActionVariant } from "@xihan-ui/core";
import type { ReactNode } from "react";
import { DownloadIcon } from "@xihan-ui/icons";
import { XhDownloadTrigger, XhIcon } from "@xihan-ui/react";

const variants: { label: string; value: ActionVariant }[] = [
  { label: "实心", value: "solid" },
  { label: "浅色", value: "subtle" },
  { label: "线框", value: "outline" },
  { label: "幽灵", value: "ghost" },
];

export default function Demo(): ReactNode {
  return variants.map(variant => (
    <XhDownloadTrigger key={variant.value} data="XiHan.UI" fileName="xihan-ui.txt" variant={variant.value}>
      <XhIcon icon={DownloadIcon} />
      {" "}
      {variant.label}
    </XhDownloadTrigger>
  ));
}
