var e=`// 键盘导航 | 来源列表使用单一 Tab 位，方向键、Home、End 移动，Enter 打开预览
import type { CitationSource } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhCitationList, XhCitationPreview, XhCitationRoot } from "@xihan-ui/react";

const sources: CitationSource[] = [
  { type: "source-url", sourceId: "a", title: "Research A", url: "https://example.com/a", anchors: [{ sourceId: "a", quote: "Evidence A" }] },
  { type: "source-url", sourceId: "b", title: "Research B", url: "https://example.com/b", anchors: [{ sourceId: "b", quote: "Evidence B" }] },
  { type: "source-url", sourceId: "c", title: "Research C", url: "https://example.com/c", anchors: [{ sourceId: "c", quote: "Evidence C" }] },
];

export default function Demo(): ReactNode {
  return (
    <>
      <p>聚焦来源后使用 ↑ / ↓、Home、End，并按 Enter 查看。</p>
      <XhCitationRoot sources={sources} loop={false} size="sm" translations={{ sources: "证据来源" }}>
        {sources.map(source => <XhCitationPreview key={source.sourceId} sourceId={source.sourceId} />)}
        <XhCitationList />
      </XhCitationRoot>
    </>
  );
}
`;export{e as default};