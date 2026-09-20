const n=`<!-- 顶部偏移 | 避让固定页头 -->
<div
  id="affix-offset-top-scroll"
  data-xh-scroll
  style="
    position: relative;
    block-size: 240px;
    inline-size: min(420px, 100%);
    overflow: auto;
    padding: 12px;
    border-radius: var(--xh-shape-surface);
    background: var(--xh-bg-subtle);
  "
>
  <div
    style="
      position: sticky;
      inset-block-start: 0;
      z-index: 1;
      block-size: 40px;
      display: flex;
      align-items: center;
      padding-inline: 8px;
      background: var(--xh-bg-subtle);
    "
  >
    吸顶栏
  </div>

  <div style="block-size: 120px"></div>

  <template id="affix-offset-top-tpl">
    <xh-affix offset-top="40" style="display: block">
      <div data-xh-part="root">
        <div
          data-xh-part="content"
          style="
            padding: 8px 12px;
            border-radius: var(--xh-shape-control);
            background: var(--xh-bg-brand-subtle);
            color: var(--xh-fg-brand);
          "
        >
          二级工具栏
        </div>
      </div>
    </xh-affix>
  </template>

  <div style="block-size: 600px"></div>
</div>

<script type="module">
  const template = document.getElementById("affix-offset-top-tpl");
  const affix = template.content.firstElementChild;
  affix.target = document.getElementById("affix-offset-top-scroll");
  template.replaceWith(affix);
<\/script>
`;export{n as default};
