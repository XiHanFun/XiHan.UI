const n=`// 挂在自己的滚动容器上 | 滚动容器归你，滚动条只要拿到它；把节点交给 scrollable 即可
import type { ReactNode } from "react";
import { XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from "@xihan-ui/react";
import { useRef } from "react";

const lines = Array.from({ length: 40 }, (_, i) => \`第 \${i + 1} 行内容\`);

// 藏掉原生滚动条的外观，滚动能力一点不动
const boxStyle = {
  blockSize: "160px",
  overflow: "auto",
  scrollbarWidth: "none",
  border: "1px solid var(--xh-border-default)",
  borderRadius: "var(--xh-shape-surface)",
  padding: "8px",
} as const;

export default function Demo(): ReactNode {
  const box = useRef<HTMLDivElement>(null);

  return (
    // 定位上下文归容器：滚动条是绝对定位的，贴的是最近那个定位祖先
    <div style={{ position: "relative", inlineSize: "240px" }}>
      <div ref={box} style={boxStyle}>
        {lines.map(line => (
          <div key={line} style={{ paddingBlock: "2px" }}>
            {line}
          </div>
        ))}
      </div>

      <XhScrollbarRoot scrollable={() => box.current} type="always">
        <XhScrollbarTrack>
          <XhScrollbarThumb />
        </XhScrollbarTrack>
      </XhScrollbarRoot>
    </div>
  );
}
`;export{n as default};
