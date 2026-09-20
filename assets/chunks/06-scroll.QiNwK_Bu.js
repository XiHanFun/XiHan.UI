const r=`<!-- 长内容滚动 | 浮层自身不限高，为内部容器设置上限并开启滚动，标题与关闭按钮就不随内容滚动 -->
<xh-popover id="popover-scroll" placement="bottom-start">
  <button data-xh-part="trigger">历史版本</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <h3 data-xh-part="title">历史版本</h3>
      <div data-xh-scroll style="max-block-size: 160px; overflow: auto">
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.18 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.17 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.16 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.15 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.14 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.13 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.12 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.11 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.10 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.9 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.8 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.7 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.6 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.5 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.4 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.3 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.2 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.1 更新了若干细节</p>
      </div>
      <button data-xh-part="close-trigger"></button>
      <div data-xh-part="arrow"></div>
    </div>
  </div>
</xh-popover>

<script type="module">
  // 文案是对象，只走 property
  document.getElementById("popover-scroll").translations = { close: "关闭" };
<\/script>
`;export{r as default};
