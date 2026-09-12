const r=`// 折叠中间层级 | 省略号与分隔符同为 ol 的直接子 li，两者都对读屏隐藏，念出来仍是「列表，共 3 项」
import type { ReactNode } from "react";
import {
  XhBreadcrumbEllipsis,
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhBreadcrumbRoot>
      <XhBreadcrumbList>
        <XhBreadcrumbItem>
          <XhBreadcrumbLink href="#/">首页</XhBreadcrumbLink>
        </XhBreadcrumbItem>
        <XhBreadcrumbSeparator />
        <XhBreadcrumbItem>
          <XhBreadcrumbLink href="#/docs">文档</XhBreadcrumbLink>
        </XhBreadcrumbItem>
        <XhBreadcrumbSeparator />
        {/* 被折叠掉的那几层，只是视觉占位，不参与列表项计数 */}
        <XhBreadcrumbEllipsis>…</XhBreadcrumbEllipsis>
        <XhBreadcrumbSeparator />
        <XhBreadcrumbItem>
          <XhBreadcrumbLink href="#/docs/deep/current" current>
            当前页
          </XhBreadcrumbLink>
        </XhBreadcrumbItem>
      </XhBreadcrumbList>
    </XhBreadcrumbRoot>
  );
}
`;export{r as default};
