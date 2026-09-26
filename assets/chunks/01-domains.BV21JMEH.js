const t=`// 声明极性 | 彩色区块写上 data-xh-ink，域内的描边、淡底、正文与主要动作都改取墨色
import type { CSSProperties, ReactNode } from "react";
import { XhButton, XhSwitch, XhTextFieldControl, XhTextFieldInput, XhTextFieldRoot } from "@xihan-ui/react";

const block: CSSProperties = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, padding: 16, borderRadius: "var(--xh-shape-surface)" };

function Controls(): ReactNode {
  return (
    <>
      <XhButton>发布</XhButton>
      <XhButton variant="outline">取消</XhButton>
      <XhSwitch defaultChecked aria-label="通知" />
      <XhTextFieldRoot>
        <XhTextFieldControl><XhTextFieldInput placeholder="搜索成员" aria-label="搜索成员" /></XhTextFieldControl>
      </XhTextFieldRoot>
    </>
  );
}

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", display: "grid", gap: 12 }}>
      <section data-xh-ink="dark" style={{ ...block, background: "var(--xh-color-yellow-300)" }}><Controls /></section>
      <section data-xh-ink="light" style={{ ...block, background: "var(--xh-color-indigo-800)" }}><Controls /></section>
    </div>
  );
}
`;export{t as default};
