const o=`// 基础用法 | 展示框是只读不是禁用：聚焦即全选，键盘用户照样能用 Ctrl / Cmd + C 自己带走
import type { ReactNode } from "react";
import { CheckIcon } from "@xihan-ui/icons";
import {
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardLabel,
  XhClipboardRoot,
  XhIcon,
} from "@xihan-ui/react";

const apiToken = "xh_live_9f2c7a41b6d84e05";

export default function Demo(): ReactNode {
  return (
    <XhClipboardRoot value={apiToken}>
      <XhClipboardLabel>接口密钥</XhClipboardLabel>
      <XhClipboardControl>
        <XhClipboardInput />
        <XhClipboardCopyTrigger>
          {/* 两个指示器都常挂 DOM、靠 hidden 互斥显隐，来回切按钮不抖宽 */}
          <XhClipboardIndicator>复制</XhClipboardIndicator>
          <XhClipboardIndicator copied>
            <XhIcon icon={CheckIcon} />
            {" "}
            已复制
          </XhClipboardIndicator>
        </XhClipboardCopyTrigger>
      </XhClipboardControl>
    </XhClipboardRoot>
  );
}
`;export{o as default};
