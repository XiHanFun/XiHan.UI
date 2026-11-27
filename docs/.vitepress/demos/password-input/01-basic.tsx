// 基础用法 | 只写根组件就按标准结构铺出标题与盒：输入框、大写锁定提示与明暗切换钮；不传 value 与 revealed 即为非受控，明暗由组件自行管理
import type { ReactNode } from "react";
import { XhPasswordInputRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhPasswordInputRoot
      label="密码"
      placeholder="请输入密码"
      translations={{
        visibilityTriggerShow: "显示密码",
        visibilityTriggerHide: "隐藏密码",
        capsLockOn: "大写锁定已打开",
        strengthMeter: "密码强度",
      }}
    />
  );
}
