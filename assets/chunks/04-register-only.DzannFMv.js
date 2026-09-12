const t=`<!-- 只注册不显示 | useHotkeys 只安装监听，展示是 Kbd/KbdGroup 的独立职责 -->
<p>
  按 Mod+K（Mac 上是 ⌘K）：已命中 <span id="hotkeys-register-only-count">0</span>
  次。这一段没有显示任何键帽。
</p>

<!-- 元素本身就是无视觉行为宿主，不需要 hidden root 或任何其他子节点 -->
<xh-hotkeys id="hotkeys-register-only" keys="Mod,k"></xh-hotkeys>

<script type="module">
  // 命中经 hot-key 事件冒泡出来，这里只记次数
  const host = document.getElementById("hotkeys-register-only");
  const readout = document.getElementById("hotkeys-register-only-count");
  let hits = 0;
  host.addEventListener("hot-key", () => {
    hits += 1;
    readout.textContent = String(hits);
  });
<\/script>
`;export{t as default};
