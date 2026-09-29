const a=`<!-- 键盘导航 | 来源列表使用单一 Tab 位，方向键、Home、End 移动，Enter 打开预览 -->
<p>聚焦来源后使用 ↑ / ↓、Home、End，并按 Enter 查看。</p>
<xh-citation id="citation-keyboard" size="sm">
  <div data-xh-part="root">
    <section data-xh-part="preview" value="a"><header data-xh-part="preview-header"><span><strong data-xh-part="preview-title">Research A</strong><span data-xh-part="preview-meta">example.com</span></span><button data-xh-part="dismiss-trigger"></button></header><blockquote data-xh-part="quote">Evidence A</blockquote><a data-xh-part="preview-link">Open source</a></section>
    <section data-xh-part="preview" value="b"><header data-xh-part="preview-header"><span><strong data-xh-part="preview-title">Research B</strong><span data-xh-part="preview-meta">example.com</span></span><button data-xh-part="dismiss-trigger"></button></header><blockquote data-xh-part="quote">Evidence B</blockquote><a data-xh-part="preview-link">Open source</a></section>
    <section data-xh-part="preview" value="c"><header data-xh-part="preview-header"><span><strong data-xh-part="preview-title">Research C</strong><span data-xh-part="preview-meta">example.com</span></span><button data-xh-part="dismiss-trigger"></button></header><blockquote data-xh-part="quote">Evidence C</blockquote><a data-xh-part="preview-link">Open source</a></section>
    <ol data-xh-part="list">
      <li data-xh-part="source" value="a"><button data-xh-part="source-link"><span data-xh-part="source-index">1</span><span><span data-xh-part="source-title">Research A</span><span data-xh-part="source-meta">example.com</span></span></button></li>
      <li data-xh-part="source" value="b"><button data-xh-part="source-link"><span data-xh-part="source-index">2</span><span><span data-xh-part="source-title">Research B</span><span data-xh-part="source-meta">example.com</span></span></button></li>
      <li data-xh-part="source" value="c"><button data-xh-part="source-link"><span data-xh-part="source-index">3</span><span><span data-xh-part="source-title">Research C</span><span data-xh-part="source-meta">example.com</span></span></button></li>
    </ol>
  </div>
</xh-citation>
<script type="module">
  const host = document.getElementById("citation-keyboard");
  host.loop = false;
  host.sources = [
    { type: "source-url", sourceId: "a", title: "Research A", url: "https://example.com/a", anchors: [{ sourceId: "a", quote: "Evidence A" }] },
    { type: "source-url", sourceId: "b", title: "Research B", url: "https://example.com/b", anchors: [{ sourceId: "b", quote: "Evidence B" }] },
    { type: "source-url", sourceId: "c", title: "Research C", url: "https://example.com/c", anchors: [{ sourceId: "c", quote: "Evidence C" }] },
  ];
  host.translations = { sources: "证据来源" };
<\/script>
`;export{a as default};
