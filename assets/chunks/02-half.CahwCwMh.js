const a=`<!-- 半星与悬停预览 | allow-half 让落点分左右半边；划过只发 hover-change，评分要点下去才改 -->
<xh-rating id="rating-half" value="2.5" allow-half>
  <div data-xh-part="root">
    <span data-xh-part="label">服务评分</span>
    <div data-xh-part="control">
      <span data-xh-part="item" value="1">★</span>
      <span data-xh-part="item" value="2">★</span>
      <span data-xh-part="item" value="3">★</span>
      <span data-xh-part="item" value="4">★</span>
      <span data-xh-part="item" value="5">★</span>
    </div>
  </div>
</xh-rating>
<p>评分：<span id="rating-half-score">2.5</span> · 悬停预览：<span id="rating-half-preview">（无）</span></p>

<script type="module">
  // 值由外面这份状态持有，组件报上来才写回去
  const rating = document.getElementById("rating-half");
  const score = document.getElementById("rating-half-score");
  const preview = document.getElementById("rating-half-preview");

  rating.addEventListener("value-change", (event) => {
    rating.value = event.detail.value;
    score.textContent = event.detail.value;
  });
  rating.addEventListener("hover-change", (event) => {
    preview.textContent = event.detail.value ?? "（无）";
  });
<\/script>
`;export{a as default};
