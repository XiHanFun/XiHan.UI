const n=`// 行数 | lines 为 1 走单行省略，大于 1 按行数裁，末行收省略号
import type { ReactNode } from "react";
import { XhTruncate } from "@xihan-ui/react";
import { useState } from "react";

const text
  = "这条商品说明写得很长：材质为 100% 长绒棉，机洗需用中性洗涤剂，不可漂白，"
    + "低温熨烫，深浅色分开洗涤，首次下水建议单独清洗以免染色。";

export default function Demo(): ReactNode {
  const [lines, setLines] = useState(2);

  return (
    <div style={{ display: "grid", gap: "12px", inlineSize: "100%", maxInlineSize: "420px" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        夹几行
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={lines}
          onChange={e => setLines(Number(e.target.value))}
        />
        {lines}
      </label>

      {/* 换行数就是换了一把尺，组件会自己重量一次，不必手动触发 */}
      <XhTruncate lines={lines}>{text}</XhTruncate>
    </div>
  );
}
`;export{n as default};
