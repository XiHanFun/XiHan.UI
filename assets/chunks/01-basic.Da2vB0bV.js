const r=`// 基础用法 | 不传 open 即为非受控；Escape 关闭、Tab 在面板里循环，展开期间页面滚不动
import type { ReactNode } from "react";
import {
  XhButton,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhDrawerRoot translations={{ close: "关闭" }}>
      {({ setOpen }) => (
        <>
          <XhDrawerTrigger>打开抽屉</XhDrawerTrigger>
          <XhDrawerContent>
            <XhDrawerTitle>筛选条件</XhDrawerTitle>
            <XhDrawerDescription>
              面板贴住右边，这是 side 的默认值。
            </XhDrawerDescription>
            <XhButton variant="solid" onClick={() => setOpen(false)}>应用并关闭</XhButton>
            <XhDrawerCloseTrigger />
          </XhDrawerContent>
        </>
      )}
    </XhDrawerRoot>
  );
}
`;export{r as default};
