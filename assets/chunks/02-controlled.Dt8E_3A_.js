var e=`// 受控状态 | activeSourceId 与 open 分别写回，来源数据仍是唯一真源
import type { CitationSource } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhCitationList, XhCitationPreview, XhCitationRoot, XhCitationText, XhCitationTrigger } from "@xihan-ui/react";
import { useState } from "react";

const sources: CitationSource[] = [
  { type: "source-url", sourceId: "one", title: "Primary research", url: "https://example.com/one", anchors: [{ sourceId: "one", quote: "Primary evidence." }] },
  { type: "source-url", sourceId: "two", title: "Follow-up analysis", url: "https://example.com/two", anchors: [{ sourceId: "two", quote: "Follow-up evidence." }] },
];

export default function Demo(): ReactNode {
  const [activeSourceId, setActiveSourceId] = useState<string | null>("two");
  const [open, setOpen] = useState(true);
  return (
    <XhCitationRoot
      sources={sources}
      activeSourceId={activeSourceId}
      open={open}
      onActiveSourceChange={details => setActiveSourceId(details.sourceId)}
      onOpenChange={details => setOpen(details.open)}
    >
      <XhCitationText>
        这段结论同时参考了主研究
        <XhCitationTrigger sourceId="one">1</XhCitationTrigger>
        与后续分析
        <XhCitationTrigger sourceId="two">2</XhCitationTrigger>
        。
      </XhCitationText>
      {sources.map(source => <XhCitationPreview key={source.sourceId} sourceId={source.sourceId} />)}
      <XhCitationList />
    </XhCitationRoot>
  );
}
`;export{e as default};