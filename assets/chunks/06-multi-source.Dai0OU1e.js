const t=`<!-- 一处多源 | 一处引用引了几个来源时写 source-ids，预览里用上一个 / 下一个在它们之间轮换，位置写在两颗翻页钮之间 -->
<xh-citation id="citation-multi">
  <div data-xh-part="root">
    <p data-xh-part="text">
      共享原语可以减少产品之间的不一致
      <!-- Web Components 里 value 写成空白分隔的几个来源 id -->
      <button data-xh-part="trigger" value="report survey" name="multi-claim">1, 2</button>。
    </p>

    <section data-xh-part="preview" value="report">
      <header data-xh-part="preview-header">
        <span>
          <strong data-xh-part="preview-title">2026 design systems report</strong>
          <span data-xh-part="preview-meta">example.com</span>
        </span>
        <button data-xh-part="prev-trigger"></button>
        <span data-xh-part="preview-index"></span>
        <button data-xh-part="next-trigger"></button>
        <button data-xh-part="dismiss-trigger"></button>
      </header>
      <blockquote data-xh-part="quote">Shared primitives reduce product inconsistency.</blockquote>
      <a data-xh-part="preview-link">Open source</a>
    </section>

    <section data-xh-part="preview" value="survey">
      <header data-xh-part="preview-header">
        <span>
          <strong data-xh-part="preview-title">Component library survey</strong>
          <span data-xh-part="preview-meta">example.com</span>
        </span>
        <button data-xh-part="prev-trigger"></button>
        <span data-xh-part="preview-index"></span>
        <button data-xh-part="next-trigger"></button>
        <button data-xh-part="dismiss-trigger"></button>
      </header>
      <blockquote data-xh-part="quote">Teams with a shared kit ship consistent flows faster.</blockquote>
      <a data-xh-part="preview-link">Open source</a>
    </section>

    <ol data-xh-part="list">
      <li data-xh-part="source" value="report">
        <button data-xh-part="source-link">
          <span data-xh-part="source-index">1</span>
          <span><span data-xh-part="source-title">2026 design systems report</span><span data-xh-part="source-meta">example.com</span></span>
        </button>
      </li>
      <li data-xh-part="source" value="survey">
        <button data-xh-part="source-link">
          <span data-xh-part="source-index">2</span>
          <span><span data-xh-part="source-title">Component library survey</span><span data-xh-part="source-meta">example.com</span></span>
        </button>
      </li>
    </ol>
  </div>
</xh-citation>

<script type="module">
  const citation = document.getElementById("citation-multi");
  citation.sources = [
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
<\/script>
`;export{t as default};
