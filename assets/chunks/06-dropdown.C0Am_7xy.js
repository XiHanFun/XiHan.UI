const n=`// 层级下拉 | 某一层要换去处时，把菜单整套放进 item 里；面包屑只管这一层的排版
import type { ReactNode } from "react";
import { ChevronDownIcon } from "@xihan-ui/icons";
import {
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
  XhIcon,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const projects = [
  { value: "web", label: "官网" },
  { value: "admin", label: "后台" },
  { value: "mobile", label: "移动端" },
];

export default function Demo(): ReactNode {
  const [current, setCurrent] = useState("admin");

  return (
    <XhBreadcrumbRoot>
      <XhBreadcrumbList>
        <XhBreadcrumbItem>
          <XhBreadcrumbLink href="#/">工作台</XhBreadcrumbLink>
        </XhBreadcrumbItem>
        <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
        <XhBreadcrumbItem>
          {/* 这一层不是链接而是一组可切换的去处 */}
          <XhMenuRoot onSelect={details => setCurrent(details.value)}>
            <XhMenuTrigger>
              {projects.find(p => p.value === current)?.label}
              <XhIcon icon={ChevronDownIcon} />
            </XhMenuTrigger>
            <XhMenuPositioner>
              <XhMenuContent>
                {projects.map(p => (
                  <XhMenuItem key={p.value} value={p.value}>
                    {p.label}
                  </XhMenuItem>
                ))}
              </XhMenuContent>
            </XhMenuPositioner>
          </XhMenuRoot>
        </XhBreadcrumbItem>
        <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
        <XhBreadcrumbItem>
          <XhBreadcrumbLink href="#/settings" current>设置</XhBreadcrumbLink>
        </XhBreadcrumbItem>
      </XhBreadcrumbList>
    </XhBreadcrumbRoot>
  );
}
`;export{n as default};
