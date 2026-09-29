const a=`<!-- 删除线、下划线与标记 | 三个开关与形态、语气叠加；需要删除或标出的原生语义时把标签写成 del、mark -->
<xh-typography>
  <div data-xh-part="root">
    <p data-xh-part="paragraph">
      现价 ¥129
      <del data-xh-part="text" variant="muted" strikethrough>原价 ¥199</del>
    </p>
    <p data-xh-part="paragraph">
      提交前请<span data-xh-part="text" underline>逐项核对</span>收货地址。
    </p>
    <p data-xh-part="paragraph">
      搜索结果中的<mark data-xh-part="text" mark>关键词</mark>会被标出，
      待确认的条目用<mark data-xh-part="text" mark tone="warning">警告色标记</mark>。
    </p>
  </div>
</xh-typography>
`;export{a as default};
