var e=`<!-- 文档来源 | source-open 把文档 SourcePart 与锚点交给宿主打开 -->
<xh-citation id="citation-document" default-open>
  <div data-xh-part="root">
    <p data-xh-part="text">引用也可以指向宿主托管的文档<button data-xh-part="trigger" value="handbook">1</button>。</p>
    <section data-xh-part="preview" value="handbook">
      <header data-xh-part="preview-header"><span><strong data-xh-part="preview-title">Design handbook.pdf</strong><span data-xh-part="preview-meta">application/pdf</span></span><button data-xh-part="dismiss-trigger"></button></header>
      <blockquote data-xh-part="quote">Every citation keeps its original locator.</blockquote>
      <button data-xh-part="preview-link">Open document</button>
    </section>
    <ol data-xh-part="list"><li data-xh-part="source" value="handbook"><button data-xh-part="source-link"><span data-xh-part="source-index">1</span><span><span data-xh-part="source-title">Design handbook.pdf</span><span data-xh-part="source-meta">application/pdf</span></span></button></li></ol>
  </div>
</xh-citation>
<p id="citation-document-status" aria-live="polite">尚未请求打开文档</p>
<script type="module">
  const host = document.getElementById("citation-document");
  const status = document.getElementById("citation-document-status");
  host.sources = [{ type: "source-document", sourceId: "handbook", title: "Design handbook.pdf", mediaType: "application/pdf", anchors: [{ sourceId: "handbook", quote: "Every citation keeps its original locator.", locator: { page: 18 } }] }];
  host.addEventListener("source-open", event => { status.textContent = \`请求打开 \${event.detail.sourceId}\`; });
<\/script>
`;export{e as default};