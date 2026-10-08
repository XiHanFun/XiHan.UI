var e=`// 回显已存的签名 | 存下 value-change 给出的数据，编辑页把它交回 defaultValue 即原样回显，之后照常续写与撤销
import type { SignaturePadStroke, SignaturePadValue } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhSignaturePadControl,
  XhSignaturePadGuide,
  XhSignaturePadPath,
  XhSignaturePadRoot,
  XhSignaturePadUndoTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

function line(points: [number, number][]): SignaturePadStroke {
  return { points: points.map(([x, y]) => ({ x, y, pressure: 0.5 })) };
}

// 上一次存下的签名：逐笔的点加上当时的坐标系，画布宽窄不同也按比例铺开
const saved: SignaturePadValue = {
  surface: { width: 352, height: 141 },
  strokes: [
    line([[40, 90], [60, 60], [80, 50], [95, 70], [100, 95], [115, 70], [140, 55], [160, 80], [175, 95], [200, 70]]),
    line([[215, 95], [240, 60], [260, 55], [270, 80], [290, 90], [312, 70]]),
  ],
};

export default function Demo(): ReactNode {
  const [strokes, setStrokes] = useState(saved.strokes.length);

  return (
    <XhSignaturePadRoot
      defaultValue={saved}
      style={{ maxInlineSize: "22rem" }}
      // 定稿的数据原样存下即可，下次回显时交回 defaultValue
      onValueChange={details => setStrokes(details.value.strokes.length)}
    >
      <XhSignaturePadControl>
        <XhSignaturePadGuide />
        <XhSignaturePadPath />
      </XhSignaturePadControl>
      <div style={{ display: "flex", gap: "var(--xh-space-2)", alignItems: "center" }}>
        <XhSignaturePadUndoTrigger>撤销</XhSignaturePadUndoTrigger>
        <span>{\`共 \${strokes} 笔\`}</span>
      </div>
    </XhSignaturePadRoot>
  );
}
`;export{e as default};