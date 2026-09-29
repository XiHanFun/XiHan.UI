const e=`<!-- GFM 扩展 | 任务列表、脚注与裸地址自动成链：渲染器按 GFM 认出它们，脚注角标按首次引用编号并链到文末定义 -->
<xh-markdown-stream id="markdown-stream-gfm" style="inline-size: 100%">
  <div data-xh-part="root">
    <div data-xh-part="content"></div>
  </div>
</xh-markdown-stream>

<script type="module">
  // 真实应用里这份数组来自 @xihan-ui/markdown 的 createStreamRenderer({ idPrefix: "release-" }).render(全文)；
  // 这份示例是裸 HTML，没有打包器，所以把渲染器的产出直接写在这里
  const stream = document.getElementById("markdown-stream-gfm");
  stream.blocks = [
    {
      key: "0:a",
      kind: "markdown",
      html: '<p>发布前的检查<sup data-footnote-ref><a href="#release-fn-1" id="release-fnref-1">1</a></sup>：</p>',
      complete: true,
    },
    {
      key: "1:b",
      kind: "markdown",
      html: '<ul>\\n<li data-task="done"><input type="checkbox" disabled checked> 构建通过</li>\\n<li data-task="done"><input type="checkbox" disabled checked> 门禁通过</li>\\n<li data-task="open"><input type="checkbox" disabled> 更新日志</li>\\n</ul>',
      complete: true,
    },
    {
      key: "2:c",
      kind: "markdown",
      html: '<p>详见 <a href="https://ui.docs.xihanfun.com">https://ui.docs.xihanfun.com</a> 的发版说明。</p>',
      complete: true,
    },
    {
      key: "3:d",
      kind: "markdown",
      html: '<section data-footnotes>\\n<ol>\\n<li id="release-fn-1" value="1"><p>按仓库的发版流程逐项确认。 <a href="#release-fnref-1" data-footnote-backref aria-label="Back to reference 1">↩</a></p></li>\\n</ol>\\n</section>',
      complete: true,
    },
  ];
<\/script>
`;export{e as default};
