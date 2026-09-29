const t=`// 一处多源 | 一处引用引了几个来源时写 source-ids，预览里用上一个 / 下一个在它们之间轮换，位置写在两颗翻页钮之间
import type { CitationSource } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhCitationList,
  XhCitationPreview,
  XhCitationRoot,
  XhCitationText,
  XhCitationTrigger,
} from "@xihan-ui/react";

const sources: CitationSource[] = [
  {
    type: "source-url",
    sourceId: "report",
    title: "2026 design systems report",
    url: "https://example.com/report",
    anchors: [{ sourceId: "report", quote: "Shared primitives reduce product inconsistency." }],
  },
  {
    type: "source-url",
    sourceId: "survey",
    title: "Component library survey",
    url: "https://example.com/survey",
    anchors: [{ sourceId: "survey", quote: "Teams with a shared kit ship consistent flows faster." }],
  },
];

export default function Demo(): ReactNode {
  return (
    <XhCitationRoot sources={sources}>
      <XhCitationText>
        共享原语可以减少产品之间的不一致
        <XhCitationTrigger sourceIds={["report", "survey"]} citationId="multi-claim">1, 2</XhCitationTrigger>
        。
      </XhCitationText>
      {sources.map(source => <XhCitationPreview key={source.sourceId} sourceId={source.sourceId} />)}
      <XhCitationList />
    </XhCitationRoot>
  );
}
`;export{t as default};
