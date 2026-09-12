const n=`// 语气 | tone 换的是当前页选中态的底色与文字色，这里预置第 3 页为当前页
import type { ReactNode } from "react";
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/react";

const tones = [
  { value: "brand", label: "brand（缺省）" },
  { value: "neutral", label: "neutral" },
  { value: "success", label: "success" },
  { value: "warning", label: "warning" },
  { value: "danger", label: "danger" },
  { value: "info", label: "info" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px" }}>
      {tones.map(t => (
        <div key={t.value} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ inlineSize: "120px", flex: "none" }}>{t.label}</span>
          <XhPaginationRoot count={50} pageSize={10} defaultPage={3} tone={t.value}>
            {({ pages }) => (
              <>
                <XhPaginationPrevTrigger />
                {pages.map((p, i) => (p === "ellipsis"
                  ? <XhPaginationEllipsisTrigger key={\`\${p}-\${i}\`} />
                  : <XhPaginationItem key={\`\${p}-\${i}\`} value={p}>{p}</XhPaginationItem>))}
                <XhPaginationNextTrigger />
              </>
            )}
          </XhPaginationRoot>
        </div>
      ))}
    </div>
  );
}
`;export{n as default};
