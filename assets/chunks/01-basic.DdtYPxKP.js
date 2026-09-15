const n=`// 基础用法 | 复制安装命令
import type { ReactNode } from "react";
import { CheckIcon, ClipboardIcon } from "@xihan-ui/icons";
import {
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardLabel,
  XhClipboardRoot,
  XhIcon,
} from "@xihan-ui/react";

const command = "pnpm add @xihan-ui/react @xihan-ui/styles";

export default function Demo(): ReactNode {
  return (
    <XhClipboardRoot value={command}>
      <XhClipboardLabel>安装命令</XhClipboardLabel>
      <XhClipboardControl>
        <XhClipboardInput />
        <XhClipboardCopyTrigger>
          <XhClipboardIndicator>
            <XhIcon icon={ClipboardIcon} />
            {" "}
            复制
          </XhClipboardIndicator>
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
`;export{n as default};
