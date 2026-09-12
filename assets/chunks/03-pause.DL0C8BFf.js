const t=`// 计时与暂停 | duration 走完自动退场；指针停在条子上或焦点进到条子里都会把计时按住，离开才接着走剩下那一段
import type { ReactNode } from "react";
import {
  XhButton,
  XhToastCloseTrigger,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [seq, setSeq] = useState(0);

  return (
    <div style={{ display: "grid", gap: "12px", justifyItems: "start" }}>
      <XhToastRoot
        key={seq}
        title="6 秒后自动收走"
        duration={6000}
        translations={{ close: "关闭" }}
      >
        {({ status, paused }) => (
          <>
            <XhToastTitle />
            <span style={{ fontSize: "12px", opacity: 0.75 }}>
              {\`状态：\${status} · \${paused ? "计时已按住" : "计时在走"}\`}
            </span>
            <XhToastCloseTrigger />
          </>
        )}
      </XhToastRoot>
      <XhButton size="sm" variant="outline" onClick={() => setSeq(seq + 1)}>重新计时</XhButton>
    </div>
  );
}
`;export{t as default};
