const n=`// 自定义角标内容 | 拆成 Root + Indicator 两件：角标里能自己排版，插槽拿得到算好的计数；不写内容才回落那串数字，showZero 让 0 留在原地
import type { ReactNode } from "react";
import {
  XhAvatarFallback,
  XhAvatarRoot,
  XhBadgeIndicator,
  XhBadgeRoot,
  XhButton,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
      {/* 函数式 children 拿到算好的计数，单位由作者往后接 */}
      <XhBadgeRoot count={12} tone="danger" label="12 条未读">
        <XhButton variant="outline">收件箱</XhButton>
        <XhBadgeIndicator>{({ text }) => \`\${text} 条\`}</XhBadgeIndicator>
      </XhBadgeRoot>

      {/* 不吃 count 的一枚：角标里是一句短标记，不是数字 */}
      <XhBadgeRoot tone="brand" label="有新功能">
        <XhButton variant="outline">工作台</XhButton>
        <XhBadgeIndicator>NEW</XhBadgeIndicator>
      </XhBadgeRoot>

      {/* showZero：计数归零也留在原地，报的是「这里确实是 0」而不是「这里没有角标」 */}
      <XhBadgeRoot count={0} showZero tone="neutral" label="0 条待办">
        <XhAvatarRoot>
          <XhAvatarFallback>曦</XhAvatarFallback>
        </XhAvatarRoot>
        <XhBadgeIndicator />
      </XhBadgeRoot>
    </div>
  );
}
`;export{n as default};
