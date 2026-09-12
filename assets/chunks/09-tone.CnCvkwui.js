const n=`// 语气 | tone 决定选中条目的勾选标记用哪族颜色，未选中的条目不受影响
import type { ReactNode } from "react";
import { XhListboxRoot } from "@xihan-ui/react";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "london", label: "London 伦敦" },
];
const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
      {tones.map(tone => (
        <XhListboxRoot
          key={tone}
          tone={tone}
          collection={cities}
          defaultValue={["beijing"]}
          label={tone}
        />
      ))}
    </div>
  );
}
`;export{n as default};
