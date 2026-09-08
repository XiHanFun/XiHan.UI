// 分节标题 | 分隔线自己排成「线 · 文字 · 线」三段；align 把文字挪到一侧，那一侧的线收成一小截
import type { ReactNode } from "react";
import { XhSeparator } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", display: "grid", gap: "12px" }}>
      {/* 标题居中：两侧各一条，等分剩下的宽度 */}
      <XhSeparator decorative>基本信息</XhSeparator>

      <p style={{ margin: 0 }}>姓名、部门、入职时间</p>

      {/* 标题靠左：左边那条收成一小截 */}
      <XhSeparator decorative align="start">联系方式</XhSeparator>

      <p style={{ margin: 0 }}>邮箱、电话</p>

      {/* 标题靠右 */}
      <XhSeparator decorative align="end">备注</XhSeparator>

      <p style={{ margin: 0 }}>其他补充说明</p>
    </div>
  );
}
