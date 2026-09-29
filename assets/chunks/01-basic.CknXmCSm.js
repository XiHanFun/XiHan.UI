const t=`// 基础用法 | SourcePart 直接驱动行内引用、来源预览和来源列表
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
    type: "source-document",
    sourceId: "spec",
    title: "Accessibility specification",
    mediaType: "application/pdf",
    anchors: [{ sourceId: "spec", quote: "Relationships must remain available to assistive technology." }],
  },
];

export default function Demo(): ReactNode {
  return (
    <XhCitationRoot sources={sources}>
      <XhCitationText>
        共享原语可以减少产品之间的不一致
        <XhCitationTrigger sourceId="report" citationId="claim-report">1</XhCitationTrigger>
        ，
        明确的可访问关系让引用在键盘与读屏中仍可追踪
        <XhCitationTrigger sourceId="spec" citationId="claim-spec">2</XhCitationTrigger>
        。
      </XhCitationText>
      {sources.map(source => <XhCitationPreview key={source.sourceId} sourceId={source.sourceId} />)}
      <XhCitationList />
    </XhCitationRoot>
  );
}
`;export{t as default};
