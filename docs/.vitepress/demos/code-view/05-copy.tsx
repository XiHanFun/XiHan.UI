// 头部内建复制 | 复制交给剪贴板：把它放进头部条，用几个槽把描边按钮压成安静形态，1500 毫秒后自己回落
import type { CSSProperties, ReactNode } from "react";
import { CheckIcon, CopyIcon } from "@xihan-ui/icons";
import {
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardRoot,
  XhCodeViewCode,
  XhCodeViewFilename,
  XhCodeViewHeader,
  XhCodeViewPre,
  XhCodeViewRoot,
  XhIcon,
} from "@xihan-ui/react";

const sample = `export function createStore(reduce: Reducer, initial: State) {
  let state = initial
  return {
    get: () => state,
    dispatch(action: Action) {
      state = reduce(state, action)
    },
  }
}`;

// 无边无底、矮一档、字号取脚注档：静息与悬停都不画描边，只换底色
const quietTrigger = {
  "--xh-clipboard-copy-trigger-border": "transparent",
  "--xh-clipboard-copy-trigger-border-hover": "transparent",
  "--xh-clipboard-copy-trigger-bg": "transparent",
  "--xh-clipboard-copy-trigger-h": "var(--xh-control-h-sm)",
  "--xh-clipboard-copy-trigger-px": "var(--xh-control-px-sm)",
  "--xh-clipboard-copy-trigger-font-size": "var(--xh-text-caption-size)",
} as CSSProperties;

export default function Demo(): ReactNode {
  return (
    <XhCodeViewRoot
      code={sample}
      lang="typescript"
      filename="store.ts"
      complete
      style={{ inlineSize: "100%" }}
    >
      <XhCodeViewHeader>
        {/* 文件名占满剩余宽度，复制按钮自然被推到头部条末端 */}
        <XhCodeViewFilename />
        <XhClipboardRoot value={sample} timeout={1500} style={quietTrigger}>
          <XhClipboardCopyTrigger>
            <XhClipboardIndicator>
              <XhIcon icon={CopyIcon} />
              {" "}
              复制
            </XhClipboardIndicator>
            <XhClipboardIndicator copied>
              <XhIcon icon={CheckIcon} />
              {" "}
              已复制
            </XhClipboardIndicator>
          </XhClipboardCopyTrigger>
        </XhClipboardRoot>
      </XhCodeViewHeader>
      <XhCodeViewPre>
        <XhCodeViewCode />
      </XhCodeViewPre>
    </XhCodeViewRoot>
  );
}
