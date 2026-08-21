const t=`<!-- 等宽数字 | 数值用等宽数字排版，反复换数时字宽不变，后面的单位不会左右挪 -->
<div style="display: flex; align-items: center; gap: 24px">
  <xh-statistic id="statistic-tabular">
    <div data-xh-part="root">
      <span data-xh-part="label">今日成交额</span>
      <span data-xh-part="value">1,111.11</span>
      <span data-xh-part="suffix">元</span>
    </div>
  </xh-statistic>

  <button type="button" id="statistic-tabular-reroll">换一组数字</button>
</div>

<script type="module">
  // 每次换一组随机数字，位数固定，只有字形在变
  const host = document.getElementById("statistic-tabular");
  const value = host.querySelector('[data-xh-part="value"]');
  document.getElementById("statistic-tabular-reroll").addEventListener("click", () => {
    const digit = () => String(Math.floor(Math.random() * 10));
    value.textContent = \`\${digit()},\${digit()}\${digit()}\${digit()}.\${digit()}\${digit()}\`;
  });
<\/script>
`;export{t as default};
