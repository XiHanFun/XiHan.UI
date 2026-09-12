const r=`// 语气 | tone 换的是当前项的文字色，以及可点那几层悬停时的文字色；末级预置为当前项
import type { ReactNode } from "react";
import {
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
} from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px" }}>
      {tones.map(t => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ inlineSize: "80px", flex: "none", fontSize: "12px" }}>{t}</span>
          <XhBreadcrumbRoot tone={t}>
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
`;export{r as default};
