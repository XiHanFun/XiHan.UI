const t=`// 悬停预览 | preview-mode="hover" 把预览放进 positioner，锚定在引用编号旁：指针停留或聚焦即出现、离开即收起，不推动正文；卡片开着时指向另一处引用直接切过去
import type { CitationSource } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhCitationList,
  XhCitationPositioner,
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
    type: "source-document",
    sourceId: "spec",
    title: "Accessibility specification",
    mediaType: "application/pdf",
    anchors: [{ sourceId: "spec", quote: "Relationships must remain available to assistive technology." }],
  },
];

export default function Demo(): ReactNode {
  return (
    <XhCitationRoot sources={sources} previewMode="hover">
      <XhCitationText>
        共享原语可以减少产品之间的不一致
        <XhCitationTrigger sourceId="report" citationId="hover-report">1</XhCitationTrigger>
        ，
        明确的可访问关系让引用在键盘与读屏中仍可追踪
        <XhCitationTrigger sourceId="spec" citationId="hover-spec">2</XhCitationTrigger>
        。
      </XhCitationText>
      <XhCitationPositioner>
        {sources.map(source => <XhCitationPreview key={source.sourceId} sourceId={source.sourceId} />)}
      </XhCitationPositioner>
      <XhCitationList />
    </XhCitationRoot>
  );
}
`;export{t as default};
