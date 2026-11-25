// 语气与尺寸 | 在 content 上写 data-tone，确认按钮随之换色，语气是共享的一层，不是本组件的 prop；size 改变面板的内边距与最大宽度，三个档位落在 content 上
import type { ReactNode } from "react";
import {
  XhPopconfirmCancelTrigger,
  XhPopconfirmConfirmTrigger,
  XhPopconfirmContent,
  XhPopconfirmDescription,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopconfirmTitle,
  XhPopconfirmTrigger,
} from "@xihan-ui/react";

const tones = ["brand", "danger", "warning"] as const;
const sizes = ["sm", "md", "lg"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-4)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-4)" }}>
        {tones.map(tone => (
          <XhPopconfirmRoot key={tone} size="sm">
            <XhPopconfirmTrigger>{tone}</XhPopconfirmTrigger>
            <XhPopconfirmPositioner>
              <XhPopconfirmContent data-tone={tone}>
                <XhPopconfirmDescription>确定要执行这一步吗？</XhPopconfirmDescription>
                <XhPopconfirmCancelTrigger>取消</XhPopconfirmCancelTrigger>
                <XhPopconfirmConfirmTrigger>确定</XhPopconfirmConfirmTrigger>
              </XhPopconfirmContent>
            </XhPopconfirmPositioner>
          </XhPopconfirmRoot>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-4)" }}>
        {sizes.map(size => (
          <XhPopconfirmRoot key={size} size={size}>
            <XhPopconfirmTrigger>{size}</XhPopconfirmTrigger>
            <XhPopconfirmPositioner>
              <XhPopconfirmContent>
                <XhPopconfirmTitle>停用这个账号</XhPopconfirmTitle>
                <XhPopconfirmDescription>
                  停用后该账号无法登录，已建立的会话会在下次刷新时失效。
                </XhPopconfirmDescription>
                <XhPopconfirmCancelTrigger>取消</XhPopconfirmCancelTrigger>
                <XhPopconfirmConfirmTrigger>停用</XhPopconfirmConfirmTrigger>
              </XhPopconfirmContent>
            </XhPopconfirmPositioner>
          </XhPopconfirmRoot>
        ))}
      </div>
    </div>
  );
}
