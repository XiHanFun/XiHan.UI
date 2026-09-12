const e=`// 放置位与箭头 | placement 是相对光标那一点的首选位，offset 把浮层从光标推开；arrow 指回那一点
import type { ReactNode } from "react";
import {
  XhContextMenuArrow,
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px" }}>
      {/* 缺省是贴着光标的 bottom-start，这里改成落在光标右侧并推开 12px */}
      <XhContextMenuRoot placement="right-start" offset={12}>
        <XhContextMenuTrigger
          style={{ display: "grid", placeItems: "center", minBlockSize: "120px" }}
        >
          <span>在这块区域上右键：菜单落在光标右侧，箭头指回光标</span>
        </XhContextMenuTrigger>
        <XhContextMenuPositioner>
          <XhContextMenuContent>
            <XhContextMenuItem value="open">
              <XhContextMenuItemText>打开</XhContextMenuItemText>
            </XhContextMenuItem>
            <XhContextMenuItem value="share">
              <XhContextMenuItemText>分享</XhContextMenuItemText>
            </XhContextMenuItem>
            <XhContextMenuSeparator />
            <XhContextMenuItem value="delete">
              <XhContextMenuItemText>删除</XhContextMenuItemText>
            </XhContextMenuItem>
          </XhContextMenuContent>
          {/* 箭头挂在 positioner 上，位置由定位引擎回填 */}
          <XhContextMenuArrow />
        </XhContextMenuPositioner>
      </XhContextMenuRoot>
    </div>
  );
}
`;export{e as default};
