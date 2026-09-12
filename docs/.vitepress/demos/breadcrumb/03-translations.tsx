// 自定义分隔符 | 替换层级之间的视觉标记
import type { ReactNode } from "react";
import { XhBreadcrumbRoot } from "@xihan-ui/react";

const items = [
  { value: "workspace", label: "工作台", href: "#/workspace" },
  { value: "projects", label: "项目", href: "#/workspace/projects" },
  { value: "xihan-ui", label: "XiHan.UI", current: true },
];

export default function Demo(): ReactNode {
  return <XhBreadcrumbRoot collection={items} renderSeparator={() => "•"} />;
}
