---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**`matrix-code` 新增 `pdf417` 与 `aztec` 两种码制；`level` 的取值域随码制，新增 `columns`。**

`format="pdf417"` 画 PDF417（ISO/IEC 15438）：字节压缩模式（每 6 个字节按 900 进制压成 5 个码字，含 ASCII 以外的字符时声明 ECI 26），GF(929) 素域里德-所罗门，九档纠错 0–8（缺省按数据量取规范推荐档），行列在宽高比最接近 3:1 的一档里挑，`columns` 可指定数据列数 1–30；每个码字行占 3 个模块高。它是堆叠条码不是点阵，`moduleShape` 不认。

`format="aztec"` 画 Aztec（ISO/IEC 24778）：大写 / 小写 / 数字三种字符模式贪心切换、其余字节成串二进制移位，紧凑型 1–4 层与完整型 4–32 层自动挑（5 层起插参考网格），字宽随层数取 6 / 8 / 10 / 12 位、各自建 GF(2^m) 域，模式信息走 GF(16)；不需要静区，缺省 `margin` 为 0。

`level` 现在是 `MatrixCodeLevel`：qr 认 L / M / Q / H，pdf417 认 0–8，aztec 认纠错码字至少占的百分比 5–95（缺省 33）；给了码制不认的值不画码，根落到 `error` 态并在 `error` 里说明取值域——不静默换成缺省档。自定义元素的 `level` attribute 照旧是字符串，数字串交给 connect 核。`columns` 三端同名；`columns` / `moduleShape` / `gs1` 给了不认它们的码制，往诊断通道报 `matrix-code.option-ignored` 警告，按没给处理。共享的 `createReedSolomon` 多一个位宽参数，QR 与 Data Matrix 不受影响。

四种码制都配了独立重写的解码器做回环，并用 zxing-cpp（WASM）逐一交叉解码过（PDF417 九档级别 × 列数 1–30 × 近容量；Aztec 1–32 层、纠错 5–80%、二进制长短移位）。
