const r=`// 读屏文案 | root 是 nav 地标，translations.root 换掉它的 aria-label，同页有多个地标时靠它区分
import type { ReactNode } from "react";
import {
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
} from "@xihan-ui/react";

const translations = { root: "文章位置" };

export default function Demo(): ReactNode {
  return (
    <XhBreadcrumbRoot translations={translations}>
      <XhBreadcrumbList>
        <XhBreadcrumbItem>
          <XhBreadcrumbLink href="#/blog">博客</XhBreadcrumbLink>
        </XhBreadcrumbItem>
        <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
        <XhBreadcrumbItem>
          <XhBreadcrumbLink href="#/blog/2026">2026</XhBreadcrumbLink>
        </XhBreadcrumbItem>
        <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
        <XhBreadcrumbItem>
          <XhBreadcrumbLink href="#/blog/2026/design-system" current>
            设计系统运行时
          </XhBreadcrumbLink>
        </XhBreadcrumbItem>
      </XhBreadcrumbList>
    </XhBreadcrumbRoot>
  );
}
`;export{r as default};
