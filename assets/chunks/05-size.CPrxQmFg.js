const n=`<!-- 尺寸 | size 换正文字号与块间距，三档共用同一份块列表 -->
<div style="display: flex; flex-direction: column; gap: 12px">
  <xh-markdown-stream class="markdown-stream-size" size="sm" style="inline-size: 100%">
    <div data-xh-part="root">
      <div data-xh-part="content"></div>
    </div>
  </xh-markdown-stream>

  <xh-markdown-stream class="markdown-stream-size" style="inline-size: 100%">
    <div data-xh-part="root">
      <div data-xh-part="content"></div>
    </div>
  </xh-markdown-stream>

  <xh-markdown-stream class="markdown-stream-size" size="lg" style="inline-size: 100%">
    <div data-xh-part="root">
      <div data-xh-part="content"></div>
    </div>
  </xh-markdown-stream>
</div>

<script type="module">
  // 真实应用里这份数组来自 @xihan-ui/markdown 的 createStreamRenderer().render(全文)；
  // 这份示例是裸 HTML，没有打包器，所以把渲染器的产出直接写在这里
  const blocks = [
    { key: "0:a", kind: "markdown", html: "<h2>结论</h2>", complete: true },
    {
      key: "1:b",
      kind: "markdown",
      html: "<p>先给<strong>结论</strong>：这段正文是一次性渲好的。</p>",
      complete: true,
    },
  ];
  for (const stream of document.querySelectorAll(".markdown-stream-size")) stream.blocks = blocks;
<\/script>
`;export{n as default};
