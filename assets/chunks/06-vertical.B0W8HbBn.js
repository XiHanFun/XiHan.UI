const n=`// 竖排菜单栏 | orientation 决定主轴：竖排时上下键在入口之间走，左右键改为展开本项的菜单
import type { ReactNode } from "react";
import { XhMenubarRoot } from "@xihan-ui/react";

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
      { value: "save", label: "保存" },
    ],
  },
  {
    value: "edit",
    label: "编辑",
    items: [
      { value: "undo", label: "撤销" },
      { value: "redo", label: "重做" },
    ],
  },
  { value: "help", label: "帮助", items: [{ value: "about", label: "关于" }] },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "100%", paddingBlockEnd: "60px" }}>
      {/* 竖排时菜单该从入口侧边长出来，placement 一并改掉 */}
      <XhMenubarRoot
        orientation="vertical"
        placement="right-start"
        offset={6}
        collection={menus}
        style={{ inlineSize: "160px" }}
      />
    </div>
  );
}
`;export{n as default};
