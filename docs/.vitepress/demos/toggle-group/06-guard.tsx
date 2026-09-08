// 拦下一次切换 | 受控时 value-change 是唯一出口：宿主不写回，值就原样不动，条件不满足的那一段永远切不过去
import type { ReactNode } from "react";
import { XhToggleGroupItem, XhToggleGroupRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [stage, setStage] = useState<string | null>("draft");
  const [saved, setSaved] = useState(false);
  const [blocked, setBlocked] = useState("");

  return (
    <>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
        <XhToggleGroupRoot
          value={stage}
          disallowEmpty
          onValueChange={(details) => {
            // 单选模式下裸值就是字符串或 null
            const next = details.value as string | null;
            if (next === "publish" && !saved) {
              setBlocked("还有未保存的改动，先保存再发布");
              return;
            }
            setBlocked("");
            setStage(next);
          }}
        >
          <XhToggleGroupItem value="draft">草稿</XhToggleGroupItem>
          <XhToggleGroupItem value="review">送审</XhToggleGroupItem>
          <XhToggleGroupItem value="publish">发布</XhToggleGroupItem>
        </XhToggleGroupRoot>
        <span style={{ fontSize: "13px" }}>{`当前：${stage}`}</span>
      </span>

      <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
        <button type="button" disabled={saved} onClick={() => setSaved(true)}>
          {saved ? "已保存" : "保存改动"}
        </button>
        {blocked && <span style={{ fontSize: "13px" }}>{blocked}</span>}
      </span>
    </>
  );
}
