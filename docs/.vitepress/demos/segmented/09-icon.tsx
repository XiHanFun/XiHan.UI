// 图标 | 段内文字前放一枚图标：图标对读屏隐藏，可及名仍是文字；直径与颜色随段走，选中与悬停一并换色
import type { ReactNode } from "react";
import { LayoutGridIcon, ListIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhSegmentedHiddenInput,
  XhSegmentedIndicator,
  XhSegmentedItem,
  XhSegmentedItemIcon,
  XhSegmentedItemText,
  XhSegmentedRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhSegmentedRoot defaultValue="list" aria-label="视图">
      <XhSegmentedIndicator />
      <XhSegmentedItem value="list">
        <XhSegmentedItemIcon><XhIcon icon={ListIcon} /></XhSegmentedItemIcon>
        <XhSegmentedItemText>列表</XhSegmentedItemText>
      </XhSegmentedItem>
      <XhSegmentedItem value="grid">
        <XhSegmentedItemIcon><XhIcon icon={LayoutGridIcon} /></XhSegmentedItemIcon>
        <XhSegmentedItemText>网格</XhSegmentedItemText>
      </XhSegmentedItem>
      <XhSegmentedHiddenInput />
    </XhSegmentedRoot>
  );
}
