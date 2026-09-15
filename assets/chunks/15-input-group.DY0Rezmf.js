const n=`// 输入组 | 圆角槽换成只留外侧的一组值，中缝用负外边距叠掉一条描边，相邻控件拼成一体
import type { CSSProperties, ReactNode } from "react";
import {
  XhButton,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";

const radius = "var(--xh-shape-control)";

// 控件盒只留左侧圆角，右边一格外扣 1px 与按钮共用一条描边
const searchControl = {
  "inlineSize": "220px",
  "marginInlineEnd": "-1px",
  "--xh-text-field-control-radius": \`\${radius} 0 0 \${radius}\`,
} as CSSProperties;
const searchButton = { "--xh-button-radius": \`0 \${radius} \${radius} 0\` } as CSSProperties;

// 前后两块固定文本与控件盒同高同描边，圆角各留一侧
const addonBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  blockSize: "var(--xh-control-h-md)",
  paddingInline: "12px",
  border: "1px solid var(--xh-border-default)",
  background: "var(--xh-bg-subtle)",
  color: "var(--xh-fg-muted)",
  fontSize: "var(--xh-text-body-size)",
};
const addonStart: CSSProperties = { ...addonBase, borderRadius: \`\${radius} 0 0 \${radius}\` };
const addonEnd: CSSProperties = { ...addonBase, borderRadius: \`0 \${radius} \${radius} 0\` };
const middleControl = {
  "inlineSize": "160px",
  "marginInline": "-1px",
  "--xh-text-field-control-radius": "0",
} as CSSProperties;

export default function Demo(): ReactNode {
  return (
    <>
      <XhTextFieldRoot placeholder="搜索文档" clearable>
        <XhTextFieldLabel>站内搜索</XhTextFieldLabel>
        <div style={{ display: "flex" }}>
          <XhTextFieldControl style={searchControl}>
            <XhTextFieldInput />
          </XhTextFieldControl>
          <XhButton style={searchButton}>搜索</XhButton>
        </div>
      </XhTextFieldRoot>

      <XhTextFieldRoot placeholder="xihanfun">
        <XhTextFieldLabel>域名</XhTextFieldLabel>
        <div style={{ display: "flex" }}>
          <span style={addonStart}>https://</span>
          <XhTextFieldControl style={middleControl}>
            <XhTextFieldInput />
          </XhTextFieldControl>
          <span style={addonEnd}>.com</span>
        </div>
      </XhTextFieldRoot>
    </>
  );
}
`;export{n as default};
