var e=`<!-- 悬停预览 | preview-mode="hover" 把预览放进 positioner，锚定在引用编号旁：指针停留或聚焦即出现、离开即收起，不推动正文；卡片开着时指向另一处引用直接切过去 -->
<xh-citation id="citation-hover" preview-mode="hover">
  <div data-xh-part="root">
    <p data-xh-part="text">
      共享原语可以减少产品之间的不一致
      <button data-xh-part="trigger" value="report" name="hover-report">1</button>，
      明确的可访问关系让引用在键盘与读屏中仍可追踪
      <button data-xh-part="trigger" value="spec" name="hover-spec">2</button>。
    </p>

    <div data-xh-part="positioner">
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
    </div>

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
  const citation = document.getElementById("citation-hover");
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
`;export{e as default};