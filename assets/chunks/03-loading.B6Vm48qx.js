const n=`// 加载结束 | loading 期间容器报 aria-busy，翻成 false 后整块收起，位置让给真内容
import type { ReactNode } from "react";
import { XhSkeletonItem, XhSkeletonRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px", justifyItems: "start" }}>
      <button type="button" onClick={() => setLoading(!loading)}>
        {loading ? "数据回来了" : "重新加载"}
      </button>

      <XhSkeletonRoot loading={loading} style={{ inlineSize: "260px" }}>
        <XhSkeletonItem />
        <XhSkeletonItem />
      </XhSkeletonRoot>

      {!loading && <p style={{ margin: 0 }}>这两行是接口回来之后的真内容。</p>}
    </div>
  );
}
`;export{n as default};
