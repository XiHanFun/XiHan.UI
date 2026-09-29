const n=`<!-- 行内引用与公式 | 正文里的 [@来源] 与 $…$ 在 html 里是占位节点，citation / math 插槽把引用角标与公式渲进去；角标就是引用来源组件的 trigger -->
<xh-citation id="markdown-stream-inline-citation">
  <div data-xh-part="root">
    <div data-xh-part="text">
      <xh-markdown-stream id="markdown-stream-inline">
        <div data-xh-part="root">
          <div data-xh-part="content"></div>
        </div>
      </xh-markdown-stream>
    </div>

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
  const citation = document.getElementById("markdown-stream-inline-citation");
  const stream = document.getElementById("markdown-stream-inline");
  const sources = [
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
  citation.sources = sources;

  // 新铺出的占位节点逐个报上来：引用放一个 trigger，并声明归外层 xh-citation 管；公式交给宿主的引擎，这里用 code 示意
  stream.addEventListener("inline-mount", (event) => {
    const { element, block, index, inline } = event.detail;
    element.replaceChildren();
    if (inline.kind === "citation") {
      const trigger = document.createElement("button");
      trigger.setAttribute("data-xh-part", "trigger");
      trigger.setAttribute("data-xh-part-owner", "citation");
      trigger.setAttribute("value", inline.sourceIds[0]);
      trigger.setAttribute("name", \`\${block.key}-\${index}\`);
      trigger.textContent = String(sources.findIndex(source => source.sourceId === inline.sourceIds[0]) + 1);
      element.append(trigger);
      return;
    }
    const code = document.createElement("code");
    code.textContent = inline.source;
    element.append(code);
  });

  // 真实应用里这份数组来自 @xihan-ui/markdown 的 createStreamRenderer().render(全文)；
  // 这份示例是裸 HTML，没有打包器，所以把渲染器的产出直接写在这里
  stream.blocks = [
    {
      key: "0:a",
      kind: "markdown",
      html: '<p>共享原语可以减少产品之间的不一致<span data-md-inline="0" data-md-citation="report">[report]</span>，可访问关系要对辅助技术保持可见<span data-md-inline="1" data-md-citation="spec">[spec]</span>。</p>',
      complete: true,
      inlines: [
        { kind: "citation", sourceIds: ["report"] },
        { kind: "citation", sourceIds: ["spec"] },
      ],
    },
    {
      key: "1:b",
      kind: "markdown",
      html: '<p>面积按 <span data-md-inline="0" data-md-math="inline">A = \\\\pi r^2</span> 计算。</p>',
      complete: true,
      inlines: [{ kind: "math", source: "A = \\\\pi r^2", display: false }],
    },
  ];
<\/script>
`;export{n as default};
