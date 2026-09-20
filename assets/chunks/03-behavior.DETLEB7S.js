const t=`<!-- 滚动方式 | 平滑返回或立即返回 -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; inline-size: min(640px, 100%)">
  <div style="position: relative">
    <div id="back-top-smooth-scroll" data-xh-scroll style="block-size: 200px; overflow: auto; padding-inline: 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
      <p style="min-block-size: 64px">平滑 · 概览</p><p style="min-block-size: 64px">平滑 · 配置</p><p style="min-block-size: 64px">平滑 · 接口</p><p style="min-block-size: 64px">平滑 · 发布</p>
    </div>
    <template id="back-top-smooth-template">
      <xh-back-top behavior="smooth" visibility-height="40" size="sm"><div data-xh-part="root" style="position: absolute; --xh-back-top-inset-block: 10px; --xh-back-top-inset-inline: 10px"><button data-xh-part="trigger"></button></div></xh-back-top>
    </template>
  </div>

  <div style="position: relative">
    <div id="back-top-auto-scroll" data-xh-scroll style="block-size: 200px; overflow: auto; padding-inline: 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
      <p style="min-block-size: 64px">立即 · 概览</p><p style="min-block-size: 64px">立即 · 配置</p><p style="min-block-size: 64px">立即 · 接口</p><p style="min-block-size: 64px">立即 · 发布</p>
    </div>
    <template id="back-top-auto-template">
      <xh-back-top behavior="auto" visibility-height="40" size="sm"><div data-xh-part="root" style="position: absolute; --xh-back-top-inset-block: 10px; --xh-back-top-inset-inline: 10px"><button data-xh-part="trigger"></button></div></xh-back-top>
    </template>
  </div>
</div>

<script type="module">
  for (const mode of ["smooth", "auto"]) {
    const template = document.getElementById(\`back-top-\${mode}-template\`);
    const backTop = template.content.firstElementChild;
    backTop.target = document.getElementById(\`back-top-\${mode}-scroll\`);
    template.replaceWith(backTop);
  }
<\/script>
`;export{t as default};
