var e=`// 图标 | 条目文字前放一枚图标：图标对读屏隐藏，可及名仍是文字；直径与颜色随条目走，选中与悬停一并换色
import type { ReactNode } from "react";
import { LayoutGridIcon, ListIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhRadioGroupItem,
  XhRadioGroupItemIcon,
  XhRadioGroupItemText,
  XhRadioGroupLabel,
  XhRadioGroupRoot,
  XhRadioGroupThumb,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhRadioGroupRoot variant="segmented" defaultValue="list">
      <XhRadioGroupLabel>视图</XhRadioGroupLabel>
      <XhRadioGroupThumb />
      <XhRadioGroupItem value="list">
        <XhRadioGroupItemIcon><XhIcon icon={ListIcon} /></XhRadioGroupItemIcon>
        <XhRadioGroupItemText>列表</XhRadioGroupItemText>
      </XhRadioGroupItem>
      <XhRadioGroupItem value="grid">
        <XhRadioGroupItemIcon><XhIcon icon={LayoutGridIcon} /></XhRadioGroupItemIcon>
        <XhRadioGroupItemText>网格</XhRadioGroupItemText>
      </XhRadioGroupItem>
    </XhRadioGroupRoot>
  );
}
`;export{e as default};