const t=`<!-- 受控状态 | activeSourceId 与 open 分别写回，来源数据仍是唯一真源 -->
<xh-citation id="citation-controlled" active-source-id="two" open>
  <div data-xh-part="root">
    <p data-xh-part="text">
      这段结论同时参考了主研究<button data-xh-part="trigger" value="one">1</button>
      与后续分析<button data-xh-part="trigger" value="two">2</button>。
    </p>
    <section data-xh-part="preview" value="one"><header data-xh-part="preview-header"><span><strong data-xh-part="preview-title">Primary research</strong><span data-xh-part="preview-meta">example.com</span></span><button data-xh-part="dismiss-trigger"></button></header><blockquote data-xh-part="quote">Primary evidence.</blockquote><a data-xh-part="preview-link">Open source</a></section>
    <section data-xh-part="preview" value="two"><header data-xh-part="preview-header"><span><strong data-xh-part="preview-title">Follow-up analysis</strong><span data-xh-part="preview-meta">example.com</span></span><button data-xh-part="dismiss-trigger"></button></header><blockquote data-xh-part="quote">Follow-up evidence.</blockquote><a data-xh-part="preview-link">Open source</a></section>
    <ol data-xh-part="list">
      <li data-xh-part="source" value="one"><button data-xh-part="source-link"><span data-xh-part="source-index">1</span><span><span data-xh-part="source-title">Primary research</span><span data-xh-part="source-meta">example.com</span></span></button></li>
      <li data-xh-part="source" value="two"><button data-xh-part="source-link"><span data-xh-part="source-index">2</span><span><span data-xh-part="source-title">Follow-up analysis</span><span data-xh-part="source-meta">example.com</span></span></button></li>
    </ol>
  </div>
</xh-citation>
<script type="module">
  const host = document.getElementById("citation-controlled");
  host.sources = [
    { type: "source-url", sourceId: "one", title: "Primary research", url: "https://example.com/one", anchors: [{ sourceId: "one", quote: "Primary evidence." }] },
    { type: "source-url", sourceId: "two", title: "Follow-up analysis", url: "https://example.com/two", anchors: [{ sourceId: "two", quote: "Follow-up evidence." }] },
  ];
  host.addEventListener("active-source-change", event => { host.activeSourceId = event.detail.sourceId; });
  host.addEventListener("open-change", event => { host.open = event.detail.open; });
<\/script>
`;export{t as default};
