// 基础用法 | 点触发器展开一组动作，再点一下收起；收起时那组按钮退出 Tab 序列
import type { ReactNode } from "react";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    // 定位壳缺省钉在视口一角；示例里改成钉在面板内，省得整页都被它压着
    <div
      style={{
        position: "relative",
        blockSize: "260px",
        inlineSize: "100%",
        border: "1px solid var(--xh-border-default)",
        borderRadius: "8px",
      }}
    >
      <XhFloatButtonRoot style={{ position: "absolute" }} offset={16}>
        <XhFloatButtonTrigger />
        <XhFloatButtonList>
          <button type="button" title="编辑">✎</button>
          <button type="button" title="分享">↗</button>
          <button type="button" title="删除">🗑</button>
        </XhFloatButtonList>
      </XhFloatButtonRoot>
    </div>
  );
}
