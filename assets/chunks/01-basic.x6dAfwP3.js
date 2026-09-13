const n=`<!-- 基础用法 | 滚动后固定工具栏 -->
<div
  id="affix-basic-scroll"
  style="
    block-size: 240px;
    inline-size: min(420px, 100%);
    overflow: auto;
    padding: 12px;
    border-radius: var(--xh-shape-surface);
    background: var(--xh-bg-subtle);
  "
>
  <div style="block-size: 120px; padding: 8px">项目概览</div>

  <template id="affix-basic-tpl">
    <xh-affix style="display: block">
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
          筛选与操作
        </div>
      </div>
    </xh-affix>
  </template>

  <div style="block-size: 600px; padding: 12px">项目动态<br><br>最近访问<br><br>团队成员</div>
</div>

<script type="module">
  const template = document.getElementById("affix-basic-tpl");
  const affix = template.content.firstElementChild;
  affix.target = document.getElementById("affix-basic-scroll");
  template.replaceWith(affix);
<\/script>
`;export{n as default};
