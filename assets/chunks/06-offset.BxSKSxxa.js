var e=`<!-- 偏移 | 离角多远用两个组件槽微调，不设 prop：圆形头像角上留白多，把状态点往里收一点才贴得住轮廓 -->
<div style="display: flex; align-items: center; gap: 24px">
  <xh-badge dot tone="success" placement="bottom-end" label="在线">
    <span data-xh-part="root">
      <xh-avatar>
        <span data-xh-part="root">
          <span data-xh-part="fallback">默</span>
        </span>
      </xh-avatar>
      <span data-xh-part="indicator"></span>
    </span>
  </xh-badge>

  <!-- 正值朝行内末端、块末端挪；贴在右下角的点往里收就是两个负值 -->
  <xh-badge dot tone="success" placement="bottom-end" label="在线" style="--xh-badge-offset-inline: -4px; --xh-badge-offset-block: -4px">
    <span data-xh-part="root">
      <xh-avatar>
        <span data-xh-part="root">
          <span data-xh-part="fallback">收</span>
        </span>
      </xh-avatar>
      <span data-xh-part="indicator"></span>
    </span>
  </xh-badge>
</div>
`;export{e as default};