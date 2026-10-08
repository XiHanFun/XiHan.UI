var e=`// 文档来源 | source-open 把文档 SourcePart 与锚点交给宿主打开
import type { CitationSource } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhCitationList, XhCitationPreview, XhCitationRoot, XhCitationText, XhCitationTrigger } from "@xihan-ui/react";
import { useState } from "react";

const sources: CitationSource[] = [{
  type: "source-document",
  sourceId: "handbook",
  title: "Design handbook.pdf",
  mediaType: "application/pdf",
  anchors: [{ sourceId: "handbook", quote: "Every citation keeps its original locator.", locator: { page: 18 } }],
}];

export default function Demo(): ReactNode {
  const [status, setStatus] = useState("尚未请求打开文档");
  return (
    <>
      <XhCitationRoot sources={sources} defaultOpen onSourceOpen={details => setStatus(\`请求打开 \${details.sourceId}\`)}>
        <XhCitationText>
          引用也可以指向宿主托管的文档
          <XhCitationTrigger sourceId="handbook">1</XhCitationTrigger>
          。
        </XhCitationText>
        <XhCitationPreview sourceId="handbook" />
        <XhCitationList />
      </XhCitationRoot>
      <p aria-live="polite">{status}</p>
    </>
  );
}
`;export{e as default};