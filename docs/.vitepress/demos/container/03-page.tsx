// 放进页面骨架 | 页头、内容与页脚各放一个同档的版心，三段的内容对齐到同一条边线；通栏的底色与分隔线留在布局各段上
import type { CSSProperties, ReactNode } from "react";
import { XhContainer, XhFlex, XhLayoutContent, XhLayoutFooter, XhLayoutHeader, XhLayoutRoot } from "@xihan-ui/react";

/** 占位条的宽度：按版心内容区的比例写。 */
function width(value: string): CSSProperties {
  return { "--xh-demo-block-inline-size": value } as CSSProperties;
}

export default function Demo(): ReactNode {
  return (
    <XhLayoutRoot split style={{ inlineSize: "100%", borderRadius: "var(--xh-shape-surface)", overflow: "hidden" }}>
      <XhLayoutHeader>
        <XhContainer maxWidth="sm">
          <XhFlex justify="between" align="center">
            <span data-demo-block="line" data-tone="brand" style={width("24%")} />
            <span data-demo-block="line" data-tone="neutral" style={width("32%")} />
          </XhFlex>
        </XhContainer>
      </XhLayoutHeader>
      <XhLayoutContent>
        <XhContainer maxWidth="sm">
          <XhFlex orientation="vertical" gap="sm">
            <span data-demo-block="line" data-tone="info" style={width("48%")} />
            <span data-demo-block="line" data-tone="neutral" />
            <span data-demo-block="line" data-tone="neutral" style={width("80%")} />
            <span data-demo-block data-tone="info" />
          </XhFlex>
        </XhContainer>
      </XhLayoutContent>
      <XhLayoutFooter>
        <XhContainer maxWidth="sm">
          <span data-demo-block="line" data-tone="neutral" style={width("36%")} />
        </XhContainer>
      </XhLayoutFooter>
    </XhLayoutRoot>
  );
}
