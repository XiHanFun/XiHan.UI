const t=`<!-- 基础用法 | SourcePart 直接驱动行内引用、来源预览和来源列表 -->
<xh-citation id="citation-basic">
  <div data-xh-part="root">
    <p data-xh-part="text">
      共享原语可以减少产品之间的不一致
      <button data-xh-part="trigger" value="report" name="claim-report">1</button>，
      明确的可访问关系让引用在键盘与读屏中仍可追踪
      <button data-xh-part="trigger" value="spec" name="claim-spec">2</button>。
    </p>

    <section data-xh-part="preview" value="report">
      <header data-xh-part="preview-header">
        <span>
          <strong data-xh-part="preview-title">2026 design systems report</strong>
          <span data-xh-part="preview-meta">example.com</span>
        </span>
        <button data-xh-part="dismiss-trigger"></button>
      </header>
      <blockquote data-xh-part="quote">Shared primitives reduce product inconsistency.</blockquote>
      <a data-xh-part="preview-link">Open source</a>
    </section>

    <section data-xh-part="preview" value="spec">
      <header data-xh-part="preview-header">
        <span>
          <strong data-xh-part="preview-title">Accessibility specification</strong>
          <span data-xh-part="preview-meta">application/pdf</span>
        </span>
        <button data-xh-part="dismiss-trigger"></button>
      </header>
      <blockquote data-xh-part="quote">Relationships must remain available to assistive technology.</blockquote>
      <button data-xh-part="preview-link">Open document</button>
    </section>

    <ol data-xh-part="list">
      <li data-xh-part="source" value="report">
        <button data-xh-part="source-link">
          <span data-xh-part="source-index">1</span>
          <span><span data-xh-part="source-title">2026 design systems report</span><span data-xh-part="source-meta">example.com</span></span>
        </button>
      </li>
      <li data-xh-part="source" value="spec">
        <button data-xh-part="source-link">
          <span data-xh-part="source-index">2</span>
          <span><span data-xh-part="source-title">Accessibility specification</span><span data-xh-part="source-meta">application/pdf</span></span>
        </button>
      </li>
    </ol>
  </div>
</xh-citation>

<script type="module">
  const citation = document.getElementById("citation-basic");
  citation.sources = [
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
<\/script>
`;export{t as default};
