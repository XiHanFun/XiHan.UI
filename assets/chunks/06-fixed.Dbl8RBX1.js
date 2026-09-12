const o=`// 吸顶与固定 | header-fixed 让头钉在滚动容器上沿，sider-fixed 让侧栏跟着钉住；两个一起用时侧栏自动让开头的高度
import type { CSSProperties, ReactNode } from "react";
import {
  XhLayoutContent,
  XhLayoutFooter,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
} from "@xihan-ui/react";

const paragraphs = Array.from({ length: 14 }, (_, i) => i + 1);

export default function Demo(): ReactNode {
  return (
    // 滚动发生在骨架外面这一层：root 的高度跟着内容长，钉住的两段才有行程可走。
    // overflow 写在这里而不是 root 上——写在 root 上，root 自己就成了一个永远滚不动的
    // 滚动容器，里面的吸附会静悄悄地不生效
    <div
      style={{
        blockSize: "260px",
        overflow: "auto",
        border: "1px solid var(--xh-border-default)",
        borderRadius: "8px",
      }}
    >
      {/* 滚动容器不是视口，把它的可视高度告诉侧栏，侧栏那道高度上限才算得准 */}
      <XhLayoutRoot
        headerFixed
        siderFixed
        bordered
        style={{ "--xh-layout-scrollport-h": "260px" } as CSSProperties}
      >
        <XhLayoutHeader>控制台</XhLayoutHeader>
        <XhLayoutSider>导航</XhLayoutSider>
        <XhLayoutContent>
          {paragraphs.map(i => (
            <p key={i} style={{ marginBlockEnd: "12px" }}>
              {\`第 \${i} 段正文。向下滚：头钉在上沿，侧栏钉在头的下沿，只有正文在走。\`}
            </p>
          ))}
        </XhLayoutContent>
        <XhLayoutFooter>版本 1.0.0</XhLayoutFooter>
      </XhLayoutRoot>
    </div>
  );
}
`;export{o as default};
