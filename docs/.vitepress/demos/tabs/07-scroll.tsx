// 放不下时滚动 | 标签带只裁主轴，两端翻页钮与滚轮把被裁掉的标签挪进视野
import type { ReactNode } from "react";
import {
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsNextTrigger,
  XhTabsPrevTrigger,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/react";

const regions = ["华北", "华东", "华南", "华中", "西南", "西北", "东北", "港澳台", "海外"];

export default function Demo(): ReactNode {
  return (
    <XhTabsRoot defaultValue="华北" style={{ inlineSize: "360px", maxInlineSize: "100%" }}>
      <XhTabsList aria-label="销售区域">
        <XhTabsPrevTrigger />
        {regions.map(region => (
          <XhTabsTrigger key={region} value={region}>
            {`${region}大区`}
          </XhTabsTrigger>
        ))}
        <XhTabsIndicator />
        <XhTabsNextTrigger />
      </XhTabsList>

      {regions.map(region => (
        <XhTabsContent key={region} value={region}>
          {`${region}大区的销售概览。`}
        </XhTabsContent>
      ))}
    </XhTabsRoot>
  );
}
