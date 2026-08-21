const t=`<!-- 排布 | 横排在左右两端留圆角，竖排改在上下两端；合边跟着换轴 -->
<div style="display: flex; align-items: flex-start; gap: 24px">
  <xh-button-group variant="outline">
    <div data-xh-part="root">
      <xh-button>
        <button data-xh-part="root">复制</button>
      </xh-button>
      <xh-button>
        <button data-xh-part="root">剪切</button>
      </xh-button>
      <xh-button>
        <button data-xh-part="root">粘贴</button>
      </xh-button>
    </div>
  </xh-button-group>

  <xh-button-group orientation="vertical" variant="outline">
    <div data-xh-part="root">
      <xh-button>
        <button data-xh-part="root">复制</button>
      </xh-button>
      <xh-button>
        <button data-xh-part="root">剪切</button>
      </xh-button>
      <xh-button>
        <button data-xh-part="root">粘贴</button>
      </xh-button>
    </div>
  </xh-button-group>
</div>
`;export{t as default};
