// 基础用法 | root 持有状态，control 是视觉盒；不传 value 与 revealed 即为非受控，明暗由组件自行管理，按钮中的图标随明暗切换
import type { ReactNode } from "react";
import {
  XhPasswordInputCapsLockIndicator,
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhPasswordInputRoot
      placeholder="请输入密码"
      translations={{
        visibilityTriggerShow: "显示密码",
        visibilityTriggerHide: "隐藏密码",
        capsLockOn: "大写锁定已打开",
        strengthMeter: "密码强度",
      }}
    >
      <XhPasswordInputLabel>密码</XhPasswordInputLabel>
      <XhPasswordInputControl>
        <XhPasswordInputInput style={{ inlineSize: "200px" }} />
        {/* 节点留空，大写锁定开着时组件把文字写进来，读屏念的就是这一段 */}
        <XhPasswordInputCapsLockIndicator />
        {/* 留空即使用皮肤内置的显示/隐藏图标，名字也由组件按状态切换 */}
        <XhPasswordInputVisibilityTrigger />
      </XhPasswordInputControl>
    </XhPasswordInputRoot>
  );
}
