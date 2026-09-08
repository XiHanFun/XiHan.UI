// 面包屑与头像位 | 面包屑整行排在标题之上（写在标记最前面），头像/图标排在返回位与标题之间；两块都可缺省
import type { ReactNode } from "react";
import {
  XhAvatarFallback,
  XhAvatarRoot,
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
  XhPageHeaderBreadcrumb,
  XhPageHeaderDescription,
  XhPageHeaderMedia,
  XhPageHeaderRoot,
  XhPageHeaderTitle,
} from "@xihan-ui/react";
import { Fragment } from "react";

const trail = [
  { label: "工作台", href: "#" },
  { label: "订单", href: "#" },
];

export default function Demo(): ReactNode {
  return (
    <XhPageHeaderRoot variant="surface" bordered>
      <XhPageHeaderBreadcrumb>
        <XhBreadcrumbRoot>
          <XhBreadcrumbList>
            {trail.map(item => (
              <Fragment key={item.label}>
                <XhBreadcrumbItem>
                  <XhBreadcrumbLink href={item.href}>{item.label}</XhBreadcrumbLink>
                </XhBreadcrumbItem>
                <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
              </Fragment>
            ))}
            <XhBreadcrumbItem>
              <XhBreadcrumbLink href="#" current>SO-20260731-004</XhBreadcrumbLink>
            </XhBreadcrumbItem>
          </XhBreadcrumbList>
        </XhBreadcrumbRoot>
      </XhPageHeaderBreadcrumb>
      <XhPageHeaderMedia>
        <XhAvatarRoot size="sm">
          <XhAvatarFallback>赵</XhAvatarFallback>
        </XhAvatarRoot>
      </XhPageHeaderMedia>
      <XhPageHeaderTitle>订单详情</XhPageHeaderTitle>
      <XhPageHeaderDescription>负责人 赵一 · 编号 SO-20260731-004</XhPageHeaderDescription>
    </XhPageHeaderRoot>
  );
}
