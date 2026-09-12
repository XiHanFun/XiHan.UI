const e=`// 尺寸 | size 换整条路径的字号与各层之间的间距，不传 size 即默认档
import type { ReactNode } from "react";
import {
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
} from "@xihan-ui/react";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "16px" }}>
      {sizes.map(s => (
        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ inlineSize: "40px", flex: "none", fontSize: "12px" }}>
            {s.label}
          </span>
          <XhBreadcrumbRoot size={s.size}>
            <XhBreadcrumbList>
              <XhBreadcrumbItem>
                <XhBreadcrumbLink href="#/">首页</XhBreadcrumbLink>
              </XhBreadcrumbItem>
              <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
              <XhBreadcrumbItem>
                <XhBreadcrumbLink href="#/components">组件</XhBreadcrumbLink>
              </XhBreadcrumbItem>
              <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
              <XhBreadcrumbItem>
                <XhBreadcrumbLink href="#/components/breadcrumb" current>
                  面包屑
                </XhBreadcrumbLink>
              </XhBreadcrumbItem>
            </XhBreadcrumbList>
          </XhBreadcrumbRoot>
        </div>
      ))}
    </div>
  );
}
`;export{e as default};
