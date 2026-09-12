// 图标与标签 | 组合图标按钮与文字按钮
import type { ReactNode } from "react";
import { EllipsisIcon, ImageIcon, VideoIcon } from "@xihan-ui/icons";
import {
  XhButton,
  XhButtonGroup,
  XhButtonGroupSeparator,
  XhButtonLabel,
  XhButtonPrefix,
  XhIcon,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhButtonGroup variant="subtle">
      <XhButton>
        <XhButtonPrefix><XhIcon icon={ImageIcon} /></XhButtonPrefix>
        <XhButtonLabel>照片</XhButtonLabel>
      </XhButton>
      <XhButtonGroupSeparator />
      <XhButton>
        <XhButtonPrefix><XhIcon icon={VideoIcon} /></XhButtonPrefix>
        <XhButtonLabel>视频</XhButtonLabel>
      </XhButton>
      <XhButtonGroupSeparator />
      <XhButton iconOnly aria-label="更多选项">
        <XhIcon icon={EllipsisIcon} />
      </XhButton>
    </XhButtonGroup>
  );
}
