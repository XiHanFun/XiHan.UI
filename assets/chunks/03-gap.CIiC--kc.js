const t=`<!-- 间距档位 | gap 一档管两处：列与列之间、同一列里项与项之间，留白始终对齐 -->
<style>
  #masonry-gap-demo [data-card] {
    padding: 12px;
    border-radius: var(--xh-radius-md);
    background: var(--xh-bg-subtle);
    color: var(--xh-fg-default);
  }

  #masonry-gap-demo [data-gap-button] {
    padding: 4px 10px;
    border: 1px solid var(--xh-border-default);
    border-radius: var(--xh-radius-sm);
    background: transparent;
    color: var(--xh-fg-default);
  }

  #masonry-gap-demo [data-gap-button][aria-pressed="true"] {
    background: var(--xh-bg-brand);
    color: var(--xh-fg-on-brand);
  }
</style>

<div id="masonry-gap-demo" style="display: flex; flex-direction: column; gap: 12px">
  <div style="display: flex; gap: 8px">
    <button type="button" data-gap-button value="xs">xs</button>
    <button type="button" data-gap-button value="sm">sm</button>
    <button type="button" data-gap-button value="md" aria-pressed="true">md</button>
    <button type="button" data-gap-button value="lg">lg</button>
    <button type="button" data-gap-button value="xl">xl</button>
  </div>

  <!-- 宿主设 display: contents，排布落在 root 上 -->
  <!-- item 只做承重的盒子，卡片样式落在它的子节点上，与 Vue 版铺出来的结构一致 -->
  <xh-masonry id="masonry-gap" columns="3" gap="md" style="display: contents">
    <div data-xh-part="root">
      <div data-xh-part="column"></div>
      <div data-xh-part="column"></div>
      <div data-xh-part="column"></div>

      <div data-xh-part="item"><div data-card style="block-size: 80px">甲</div></div>
      <div data-xh-part="item"><div data-card style="block-size: 120px">乙</div></div>
      <div data-xh-part="item"><div data-card style="block-size: 60px">丙</div></div>
      <div data-xh-part="item"><div data-card style="block-size: 100px">丁</div></div>
      <div data-xh-part="item"><div data-card style="block-size: 90px">戊</div></div>
      <div data-xh-part="item"><div data-card style="block-size: 70px">己</div></div>
    </div>
  </xh-masonry>
</div>

<script type="module">
  const host = document.getElementById("masonry-gap");
  const buttons = document.querySelectorAll("#masonry-gap-demo [data-gap-button]");
  for (const button of buttons) {
    button.addEventListener("click", () => {
      host.gap = button.value;
      for (const other of buttons) {
        other.setAttribute("aria-pressed", String(other === button));
      }
    });
  }
<\/script>
`;export{t as default};
