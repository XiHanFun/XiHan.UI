// 基础用法 | 同时切换多个文本格式
import type { ReactNode } from "react";
import { BoldIcon, ItalicIcon, StrikethroughIcon, UnderlineIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggleGroupItem, XhToggleGroupRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhToggleGroupRoot defaultValue={["bold"]} multiple>
      <XhToggleGroupItem value="bold" aria-label="粗体">
        <XhIcon icon={BoldIcon} />
      </XhToggleGroupItem>
      <XhToggleGroupItem value="italic" aria-label="斜体">
        <XhIcon icon={ItalicIcon} />
      </XhToggleGroupItem>
      <XhToggleGroupItem value="underline" aria-label="下划线">
        <XhIcon icon={UnderlineIcon} />
      </XhToggleGroupItem>
      <XhToggleGroupItem value="strike" aria-label="删除线">
        <XhIcon icon={StrikethroughIcon} />
      </XhToggleGroupItem>
    </XhToggleGroupRoot>
  );
}
