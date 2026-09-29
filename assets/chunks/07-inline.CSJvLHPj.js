const n=`// 随文 | 缺省高度是所在行的一行字高、宽 6rem，放进正文或更小的说明文字里都不撑高这一行
import type { ReactNode } from "react";
import { XhSparkline } from "@xihan-ui/react";

const signups = [42, 38, 51, 47, 60, 58, 66];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-3)" }}>
      <div>
        本周注册
        {" "}
        <XhSparkline data={signups} aria-label="本周每日注册数" />
        {" "}
        共 362 人，较上周多 18%。
      </div>
      <div style={{ color: "var(--xh-fg-muted)", fontSize: "var(--xh-text-caption-size)" }}>
        数据截至今日 18:00
        {" "}
        <XhSparkline data={signups} markers="none" aria-label="本周每日注册数" />
      </div>
    </div>
  );
}
`;export{n as default};
