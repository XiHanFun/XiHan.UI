/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/**
 * PDF417 编码器：把一段文本算成堆叠条码的布尔矩阵（ISO/IEC 15438）。
 *
 * 纯函数：不碰 DOM、不读全局，同样的入参恒给同一份矩阵。
 *
 * 只走字节压缩模式——内容按 UTF-8 取字节，每 6 个字节按 900 进制压成 5 个码字，零头逐字节一个码字；
 * 含 ASCII 以外的字符时最前面放 ECI 26 声明，读码器按 UTF-8 还原。
 * 文本压缩与数字压缩没有实现：它们把纯文本 / 纯数字压得更紧，同样的内容能落在更小的符号上；
 * 扫出来的内容不受影响。
 *
 * 结构：每行 = 起始图形 + 左行指示符 + c 个数据码字 + 右行指示符 + 终止图形，各 17 个模块（终止 18）；
 * 码字总数 = 长度描述符 1 + 数据 + 填充 + 纠错 2^(level+1)，铺满 r 行 × c 列。
 * 纠错是 GF(929) 上的里德-所罗门，素域，跟 GF(2^m) 那套不通用，在本文件内自算。
 */

/** 纠错级别 0–8，纠错码字数依次是 2、4、8、…、512。 */
export type Pdf417Level = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export interface Pdf417EncodeOptions {
  /** 纠错级别；缺省按数据量取规范推荐的最低档（≤40 个码字 2 级，≤160 个 3 级，≤320 个 4 级，≤863 个 5 级，再多 6 级）。 */
  readonly level?: Pdf417Level
  /** 数据列数 1–30；缺省在宽高比最接近 3:1 的那一档里挑。 */
  readonly columns?: number
}

export interface Pdf417Matrix {
  /** 数据列数（不含起始、终止与两个行指示符）。 */
  readonly columns: number
  /** 码字行数。 */
  readonly rows: number
  /** 实际用的纠错级别。 */
  readonly level: Pdf417Level
  /** 每行模块宽：17 × (列数 + 3) + 18。 */
  readonly width: number
  /** 每个码字行占几个模块高。 */
  readonly rowHeight: number
  /** 模块矩阵，[行][列]，true = 深色；每个码字行已按 rowHeight 复制成多行模块。 */
  readonly modules: readonly (readonly boolean[])[]
}

/** 码字空间：0–928。 */
const GF = 929
/** 填充码字。 */
const PAD = 900
/** ECI 声明：后面跟一个 0–899 的码字，即 ECI 编号（26 是 UTF-8）。 */
const ECI = 927
const ECI_UTF8 = 26
/** 字节压缩的两个锁存：字节数是 6 的倍数用 924，否则 901。 */
const BYTE_LATCH_EXACT = 924
const BYTE_LATCH = 901
/** 最少 3 行、最多 90 行；数据列 1–30。 */
const MIN_ROWS = 3
const MAX_ROWS = 90
const MIN_COLUMNS = 1
const MAX_COLUMNS = 30
/** 每个码字行占的模块高：规范推荐行高 ≥ 3X。 */
const ROW_HEIGHT = 3
/** 宽高比目标：宽是高的三倍左右时最容易扫。 */
const PREFERRED_RATIO = 3

/** 起始与终止图形的位图，高位在前：起始 17 位，终止 18 位。 */
const START_PATTERN = 0x1FEA8
const STOP_PATTERN = 0x3FA29

/**
 * 929 个码字在三个簇里的条空图案（ISO/IEC 15438 Annex A），每项 17 位、高位在前，四条四空、起于条。
 * 逐簇按码字值升序，每个码字 5 个十六进制字符。行号 mod 3 决定用哪一簇。
 */
const CLUSTERS: readonly string[] = [
  // 簇 0（行号 mod 3 = 0）
  [
    '1d5c01eaf01f57c1d4e01ea781f53e1a8c01d4701a860150401a830150201adc01d6f01eb7c1ace01d6781eb3e158c01ac701586015dc01aef01d77c15ce01ae781d73e15c701ae3c15ef01af7c15e781af3e15f7c1f5fa1d2e01e9781f4be1a4c01d2701e93c1a4601d238148401a4301d21c148201a418148101a6e01d3781e9be14cc01a6701d33c14c601a6381d31e14c301a61c14ee01a7781d3be14e701a73c14e381a71e14f781a7be14f3c14f1e1a2c01d1701e8bc1a2601d1381e89e144401a2301d11c144201a2181441014408146c01a3701d1bc146601a3381d19e146301a31c146181460c147701a3bc147381a39e1471c147bc',
    '1a1601d0b81e85e142401a1301d09c142201a1181d08e142101a10c142081a106143601a1b81d0de143301a19c143181a18e1430c143061a1de1438e141401a0b01d05c141201a0981d04e141101a08c141081a08614104141b0141981418c140a01d02e1a04c1a046140821cae01e5781f2be194c01ca701e53c194601ca381e51e128401943012820196e01cb781e5be12cc0196701cb3c12c601963812c3012c1812ee0197781cbbe12e701973c12e3812e1c12f78197be12f3c12fbe1dac01ed701f6bc1da601ed381f69e1b4401da301ed1c1b4201da181ed0e1b4101da0c192c01c9701e4bc1b6c0192601c9381e49e1b6601db381ed9e',
    '16c4012420192181c90e16c201b61816c10126c0193701c9bc16ec012660193381c99e16e601b7381db9e16e301261816e1812770193bc16f70127381939e16f381b79e16f1c127bc16fbc1279e16f9e1d9601ecb81f65e1b2401d9301ec9c1b2201d9181ec8e1b2101d90c1b2081b204191601c8b81e45e1b360191301c89c16640122201d99c1c88e16620122101910c166101b30c191061220412360191b81c8de16760123301919c167301b39c1918e167181230c12306123b8191de167b81239c1679c1238e1678e167de1b1401d8b01ec5c1b1201d8981ec4e1b1101d88c1b1081d8861b1041b10212140190b01c85c163401212019098',
    '1c84e163201b1981d8ce163101210819086163081b18616304121b0190dc163b012198190ce163981b1ce1638c1218616386163dc163ce1b0a01d8581ec2e1b0901d84c1b0881d8461b0841b082120a0190581c82e161a0120901904c161901b0cc1904616188120841618412082120d8161d8161cc161c61d82c1d8261b0421902c12048160c8160c4160c218ac01c5701e2bc18a601c5381144018a301c51c1142018a181141011408116c018b701c5bc1166018b381c59e1163018b1c116181160c1177018bbc1173818b9e1171c117bc1179e1cd601e6b81f35e19a401cd301e69c19a201cd181e68e19a101cd0c19a081cd06189601c4b8',
    '1e25e19b60189301c49c13640112201cd9c1c48e1362019b181890c13610112081360811360189b81c4de13760113301cdde1373019b9c1898e137181130c1370c113b8189de137b81139c1379c1138e113de137de1dd401eeb01f75c1dd201ee981f74e1dd101ee8c1dd081ee861dd04199401ccb01e65c1bb40199201eedc1e64e1bb201dd981eece1bb10199081cc861bb081dd861990211140188b01c45c1334011120188981c44e1774013320199981ccce177201bb981ddce188861771013308199861770811102111b0188dc133b011198188ce177b013398199ce177981bbce1118613386111dc133dc111ce177dc133ce1dca01ee58',
    '1f72e1dc901ee4c1dc881ee461dc841dc82198a01cc581e62e1b9a0198901ee6e1b9901dccc1cc461b988198841b984198821b982110a0188581c42e131a0110901884c173a013190198cc18846173901b9cc1108417388131841108213182110d81886e131d8110cc173d8131cc110c6173cc131c6110ee173ee1dc501ee2c1dc481ee261dc441dc42198501cc2c1b8d0198481cc261b8c81dc661b8c4198421b8c2110501882c130d01104818826171d0130c819866171c81b8e611042171c4130c2171c2130ec171ec171e61ee161dc221cc1619824198221102813068170e811022130621856010a401853010a20185181c28e10a101850c',
    '10a081850610b60185b81c2de10b301859c10b181858e10b0c10b0610bb8185de10b9c10b8e10bde18d401c6b01e35c18d201c69818d101c68c18d081c68618d0410940184b01c25c11b40109201c6dc1c24e11b2018d981c6ce11b10109081848611b0818d8610902109b0184dc11bb010998184ce11b9818dce11b8c10986109dc11bdc109ce11bce1cea01e7581f3ae1ce901e74c1ce881e7461ce841ce8218ca01c65819da018c901c64c19d901cecc1c64619d8818c8419d8418c8219d82108a018458119a0108901c66e13ba01199018ccc1844613b9019dcc1088413b88119841088211982108d81846e119d8108cc13bd8119cc108c6',
    '13bcc119c6108ee119ee13bee1ef501f7ac1ef481f7a61ef441ef421ce501e72c1ded01ef6c1e7261dec81ef661dec41ce421dec218c501c62c19cd018c481c6261bdd019cc81ce661bdc81dee618c421bdc419cc21bdc2108501842c118d01084818426139d0118c818c6617bd0139c819ce61084217bc81bde6118c217bc41086c118ec10866139ec118e617bec139e617be61ef281f7961ef241ef221ce281e7161de681ef361de641ce221de6218c281c61619c6818c241bce819c6418c221bce419c621bce210828184161186818c36138e81186410822179e8138e411862179e4138e2179e211876179f61ef121de341de3219c341bc74',
    '1bc721183413874178f4178f2105401052018298105101050810504105b0105981058c10586105dc105ce186a0186901c34c186881c3461868418682104a01825810da0186d81824c10d90186cc10d88186c610d841048210d82104d81826e10dd8186ee10dcc104c610dc6104ee10dee1c7501c7481c7441c7421865018ed01c76c1c32618ec81c76618ec41864218ec21045010cd0104481822611dd010cc81044411dc810cc41044211dc410cc21046c10cec1046611dec10ce611de61e7a81e7a41e7a21c7281cf681e7b61cf641c7221cf62186281c31618e681c73619ee818e641862219ee418e6219ee2104281821610c681863611ce8',
    '10c641042213de811ce410c6213de411ce21043610c7611cf613df61f7d41f7d21e7941efb41e7921efb21c7141cf341c7121df741cf321df721861418e341861219e7418e321bef4',
  ].join(''),
  // 簇 1（行号 mod 3 = 1）
  [
    '1f5601fab81ea401f5301fa9c1ea201f5181fa8e1ea101f50c1ea081f5061ea041eb601f5b81fade1d6401eb301f59c1d6201eb181f58e1d6101eb0c1d6081eb061d6041d7601ebb81f5de1ae401d7301eb9c1ae201d7181eb8e1ae101d70c1ae081d7061ae041af601d7b81ebde15e401af301d79c15e201af181d78e15e101af0c15e081af0615f601afb81d7de15f301af9c15f181af8e15f0c15fb81afde15f9c15f8e1e9401f4b01fa5c1e9201f4981fa4e1e9101f48c1e9081f4861e9041e9021d3401e9b01f4dc1d3201e9981f4ce1d3101e98c1d3081e9861d3041d3021a7401d3b01e9dc1a7201d3981e9ce1a7101d38c1a7081d386',
    '1a7041a70214f401a7b01d3dc14f201a7981d3ce14f101a78c14f081a78614f0414fb01a7dc14f981a7ce14f8c14f8614fdc14fce1e8a01f4581fa2e1e8901f44c1e8881f4461e8841e8821d1a01e8d81f46e1d1901e8cc1d1881e8c61d1841d1821a3a01d1d81e8ee1a3901d1cc1a3881d1c61a3841a382147a01a3d81d1ee147901a3cc147881a3c61478414782147d81a3ee147cc147c6147ee1e8501f42c1e8481f4261e8441e8421d0d01e86c1d0c81e8661d0c41d0c21a1d01d0ec1a1c81d0e61a1c41a1c2143d01a1ec143c81a1e6143c4143c2143ec143e61e8281f4161e8241e8221d0681e8361d0641d0621a0e81d0761a0e41a0e2',
    '141e81a0f6141e4141e21e8141e8121d0341d0321a0741a0721e5401f2b01f95c1e5201f2981f94e1e5101f28c1e5081f2861e5041e5021cb401e5b01f2dc1cb201e5981f2ce1cb101e58c1cb081e5861cb041cb02197401cbb01e5dc197201cb981e5ce197101cb8c197081cb86197041970212f40197b01cbdc12f20197981cbce12f101978c12f081978612f0412fb0197dc12f98197ce12f8c12f8612fdc12fce1f6a01fb5816bf01f6901fb4c169f81f6881fb46168fc1f6841f6821e4a01f2581f92e1eda01e4901fb6e1ed901f6cc1f2461ed881e4841ed841e4821ed821c9a01e4d81f26e1dba01c9901e4cc1db901edcc1e4c61db88',
    '1c9841db841c9821db82193a01c9d81e4ee1b7a0193901c9cc1b7901dbcc1c9c61b788193841b784193821b782127a0193d81c9ee16fa012790193cc16f901b7cc193c616f881278416f8412782127d8193ee16fd8127cc16fcc127c616fc6127ee1f6501fb2c165f81f6481fb26164fc1f6441647e1f6421e4501f22c1ecd01e4481f2261ecc81f6661ecc41e4421ecc21c8d01e46c1d9d01c8c81e4661d9c81ece61d9c41c8c21d9c2191d01c8ec1b3d0191c81c8e61b3c81d9e61b3c4191c21b3c2123d0191ec167d0123c8191e6167c81b3e6167c4123c2167c2123ec167ec123e6167e61f6281fb16162fc1f6241627e1f6221e4281f216',
    '1ec681f6361ec641e4221ec621c8681e4361d8e81c8641d8e41c8621d8e2190e81c8761b1e81d8f61b1e4190e21b1e2121e8190f6163e8121e4163e4121e2163e2121f6163f61f6141617e1f6121e4141ec341e4121ec321c8341d8741c8321d872190741b0f4190721b0f2120f4161f4120f2161f21f60a1e40a1ec1a1c81a1d83a1903a1b07a1e2a01f1581f8ae1e2901f14c1e2881f1461e2841e2821c5a01e2d81f16e1c5901e2cc1c5881e2c61c5841c58218ba01c5d81e2ee18b901c5cc18b881c5c618b8418b82117a018bd81c5ee1179018bcc1178818bc61178411782117d818bee117cc117c6117ee1f3501f9ac135f81f3481f9a6',
    '134fc1f3441347e1f3421e2501f12c1e6d01e2481f1261e6c81f3661e6c41e2421e6c21c4d01e26c1cdd01c4c81e2661cdc81e6e61cdc41c4c21cdc2189d01c4ec19bd0189c81c4e619bc81cde619bc4189c219bc2113d0189ec137d0113c8189e6137c819be6137c4113c2137c2113ec137ec113e6137e61fba8175f01bafc1fba4174f81ba7e1fba21747c1743e1f3281f996132fc1f7681fbb6176fc1327e1f7641f3221767e1f7621e2281f1161e6681e2241eee81f7761e2221eee41e6621eee21c4681e2361cce81c4641dde81cce41c4621dde41cce21dde2188e81c476199e8188e41bbe8199e4188e21bbe4199e21bbe2111e8188f6',
    '133e8111e4177e8133e4111e2177e4133e2177e2111f6133f61fb94172f81b97e1fb921727c1723e1f3141317e1f7341f3121737e1f7321e2141e6341e2121ee741e6321ee721c4341cc741c4321dcf41cc721dcf218874198f4188721b9f4198f21b9f2110f4131f4110f2173f4131f2173f21fb8a1717c1713e1f30a1f71a1e20a1e61a1ee3a1c41a1cc3a1dc7a1883a1987a1b8fa1107a130fa171fa170be1e1501f0ac1e1481f0a61e1441e1421c2d01e16c1c2c81e1661c2c41c2c2185d01c2ec185c81c2e6185c4185c210bd0185ec10bc8185e610bc410bc210bec10be61f1a81f8d611afc1f1a411a7e1f1a21e1281f0961e3681e124',
    '1e3641e1221e3621c2681e1361c6e81c2641c6e41c2621c6e2184e81c27618de8184e418de4184e218de2109e8184f611be8109e411be4109e211be2109f611bf61f9d413af819d7e1f9d213a7c13a3e1f1941197e1f3b41f19213b7e1f3b21e1141e3341e1121e7741e3321e7721c2341c6741c2321cef41c6721cef21847418cf41847219df418cf219df2108f4119f4108f213bf4119f213bf217af01bd7c17a781bd3e17a3c17a1e1f9ca1397c1fbda17b7c1393e17b3e1f18a1f39a1f7ba1e10a1e31a1e73a1ef7a1c21a1c63a1ce7a1defa1843a18c7a19cfa1bdfa1087a118fa139fa179781bcbe1793c1791e138be179be178bc1789e',
    '1785e1e0a81e0a41e0a21c1681e0b61c1641c162182e81c176182e4182e2105e8182f6105e4105e2105f61f0d410d7e1f0d21e0941e1b41e0921e1b21c1341c3741c1321c37218274186f418272186f2104f410df4104f210df21f8ea11d7c11d3e1f0ca1f1da1e08a1e19a1e3ba1c11a1c33a1c77a1823a1867a18efa1047a10cfa11dfa13d7819ebe13d3c13d1e11cbe13dbe17d701bebc17d381be9e17d1c17d0e13cbc17dbc13c9e17d9e17cb81be5e17c9c17c8e13c5e17cde17c5c17c4e17c2e1c0b41c0b21817418172102f4102f21e0da1c09a1c1ba1813a1837a1027a106fa10ebe11ebc11e9e13eb819f5e13e9c13e8e11e5e13ede',
    '17eb01bf5c17e981bf4e17e8c17e8613e5c17edc13e4e17ece17e581bf2e17e4c17e4613e2e17e6e17e2c17e2610f5e11f5c11f4e13f5819fae13f4c13f4611f2e13f6e13f2c13f26',
  ].join(''),
  // 簇 2（行号 mod 3 = 2）
  [
    '1abe01d5f8153c01a9f01d4fc151e01a8f81d47e150f01a87c150781fad015be01adf81fac8159f01acfc1fac4158f81ac7e1fac21587c1f5d01faec15df81f5c81fae615cfc1f5c415c7e1f5c21ebd01f5ec1ebc81f5e61ebc41ebc21d7d01ebec1d7c81ebe61d7c41d7c21afd01d7ec1afc81d7e61afc414bc01a5f01d2fc149e01a4f81d27e148f01a47c148781a43e1483c1fa6814df01a6fc1fa6414cf81a67e1fa6214c7c14c3e1f4e81fa7614efc1f4e414e7e1f4e21e9e81f4f61e9e41e9e21d3e81e9f61d3e41d3e21a7e81d3f61a7e41a7e2145e01a2f81d17e144f01a27c144781a23e1443c1441e1fa34146f81a37e1fa321467c',
    '1463e1f4741477e1f4721e8f41e8f21d1f41d1f21a3f41a3f2142f01a17c142781a13e1423c1421e1fa1a1437c1433e1f43a1e87a1d0fa141781a0be1413c1411e141be140bc1409e12bc0195f01cafc129e0194f81ca7e128f01947c128781943e1283c1f96812df0196fc1f96412cf81967e1f96212c7c12c3e1f2e81f97612efc1f2e412e7e1f2e21e5e81f2f61e5e41e5e21cbe81e5f61cbe41cbe2197e81cbf6197e4197e21b5e01daf81ed7e169c01b4f01da7c168e01b4781da3e168701b43c168381b41e1681c125e0192f81c97e16de0124f01927c16cf01b67c1923e16c781243c16c3c1241e16c1e1f934126f81937e1fb741f932',
    '16ef81267c1fb7216e7c1263e16e3e1f2741277e1f6f41f27216f7e1f6f21e4f41edf41e4f21edf21c9f41dbf41c9f21dbf2193f4193f2165c01b2f01d97c164e01b2781d93e164701b23c164381b21e1641c1640e122f01917c166f0122781913e166781b33e1663c1221e1661e1f91a1237c1fb3a1677c1233e1673e1f23a1f67a1e47a1ecfa1c8fa1d9fa191fa162e01b1781d8be162701b13c162381b11e1621c1620e12178190be163781213c1633c1211e1631e121be163be161701b0bc161381b09e1611c1610e120bc161bc1209e1619e160b81b05e1609c1608e1205e160de1605c1604e115e018af81c57e114f018a7c1147818a3e',
    '1143c1141e1f8b4116f818b7e1f8b21167c1163e1f1741177e1f1721e2f41e2f21c5f41c5f218bf418bf2135c019af01cd7c134e019a781cd3e1347019a3c1343819a1e1341c1340e112f01897c136f0112781893e1367819b3e1363c1121e1361e1f89a1137c1f9ba1377c1133e1373e1f13a1f37a1e27a1e6fa1c4fa1cdfa189fa1bae01dd781eebe174c01ba701dd3c174601ba381dd1e174301ba1c174181ba0e1740c132e0199781ccbe176e0132701993c176701bb3c1991e176381321c1761c1320e1760e11178188be133781113c177781333c1111e1773c1331e1771e111be133be177be172c01b9701dcbc172601b9381dc9e17230',
    '1b91c172181b90e1720c1720613170198bc17370131381989e173381b99e1731c1310e1730e110bc131bc1109e173bc1319e1739e171601b8b81dc5e171301b89c171181b88e1710c17106130b81985e171b81309c1719c1308e1718e1105e130de171de170b01b85c170981b84e1708c170861305c170dc1304e170ce170581b82e1704c170461302e1706e1702c1702610af01857c10a781853e10a3c10a1e10b7c10b3e1f0ba1e17a1c2fa185fa11ae018d781c6be11a7018d3c11a3818d1e11a1c11a0e10978184be11b781093c11b3c1091e11b1e109be11bbe13ac019d701cebc13a6019d381ce9e13a3019d1c13a1819d0e13a0c13a06',
    '1197018cbc13b701193818c9e13b381191c13b1c1190e13b0e108bc119bc1089e13bbc1199e13b9e1bd601deb81ef5e17a401bd301de9c17a201bd181de8e17a101bd0c17a081bd0617a041396019cb81ce5e17b601393019c9c17b301bd9c19c8e17b181390c17b0c1390617b06118b818c5e139b81189c17bb81399c1188e17b9c1398e17b8e1085e118de139de17bde179401bcb01de5c179201bc981de4e179101bc8c179081bc861790417902138b019c5c179b01389819c4e179981bcce1798c13886179861185c138dc1184e179dc138ce179ce178a01bc581de2e178901bc4c178881bc4617884178821385819c2e178d81384c178cc',
    '13846178c61182e1386e178ee178501bc2c178481bc2617844178421382c1786c1382617866178281bc161782417822138161783610578182be1053c1051e105be10d70186bc10d381869e10d1c10d0e104bc10dbc1049e10d9e11d6018eb81c75e11d3018e9c11d1818e8e11d0c11d0610cb81865e11db810c9c11d9c10c8e11d8e1045e10cde11dde13d4019eb01cf5c13d2019e981cf4e13d1019e8c13d0819e8613d0413d0211cb018e5c13db011c9818e4e13d9819ece13d8c11c8613d8610c5c11cdc10c4e13ddc11cce13dce1bea01df581efae1be901df4c1be881df461be841be8213ca019e581cf2e17da013c9019e4c17d901becc',
    '19e4617d8813c8417d8413c8217d8211c5818e2e13cd811c4c17dd813ccc11c4617dcc13cc617dc610c2e11c6e13cee17dee1be501df2c1be481df261be441be4213c5019e2c17cd013c4819e2617cc81be6617cc413c4217cc211c2c13c6c11c2617cec13c6617ce61be281df161be241be2213c2819e1617c6813c2417c6413c2217c6211c1613c3617c761be141be1213c1417c3413c1217c32102bc1029e106b81835e1069c1068e1025e106de10eb01875c10e981874e10e8c10e861065c10edc1064e10ece11ea018f581c7ae11e9018f4c11e8818f4611e8411e8210e581872e11ed818f6e11ecc10e4611ec61062e10e6e11eee19f50',
    '1cfac19f481cfa619f4419f4211e5018f2c13ed019f6c18f2613ec811e4413ec411e4213ec210e2c11e6c10e2613eec11e6613ee61dfa81efd61dfa41dfa219f281cf961bf6819f241bf6419f221bf6211e2818f1613e6811e2417ee813e6411e2217ee413e6217ee210e1611e3613e7617ef61df941df9219f141bf3419f121bf3211e1413e3411e1217e7413e3217e721df8a19f0a1bf1a11e0a13e1a17e3a1035c1034e10758183ae1074c107461032e1076e10f50187ac10f48187a610f4410f421072c10f6c1072610f6618fa81c7d618fa418fa210f281879611f6818fb611f6410f2211f621071610f3611f761cfd41cfd218f9419fb4',
    '18f9219fb210f1411f3410f1213f7411f3213f721cfca18f8a19f9a10f0a11f1a13f3a103ac103a6107a8183d6107a4107a210396107b6187d4187d21079410fb41079210fb21c7ea',
  ].join(''),
]

/** 取某簇（0–2）里某个码字（0–928）的 17 位条空图案，高位在前。 */
export function pdf417Pattern(cluster: number, codeword: number): number {
  return Number.parseInt(CLUSTERS[cluster]!.slice(codeword * 5, codeword * 5 + 5), 16)
}

/** 纠错级别对应的纠错码字数：2^(level + 1)。 */
export function pdf417EccCount(level: Pdf417Level): number {
  return 1 << (level + 1)
}

/** 规范推荐的最低纠错级别，按数据码字数分档。 */
export function pdf417RecommendedLevel(dataCodewords: number): Pdf417Level {
  if (dataCodewords <= 40)
    return 2
  if (dataCodewords <= 160)
    return 3
  if (dataCodewords <= 320)
    return 4
  if (dataCodewords <= 863)
    return 5
  return 6
}

/** 按 UTF-8 取字节。 */
function utf8Bytes(text: string): number[] {
  const out: number[] = []
  for (const char of text) {
    let code = char.codePointAt(0) ?? 0
    if (code >= 0xD800 && code <= 0xDFFF)
      code = 0xFFFD
    if (code < 0x80)
      out.push(code)
    else if (code < 0x800)
      out.push(0xC0 | (code >>> 6), 0x80 | (code & 0x3F))
    else if (code < 0x10000)
      out.push(0xE0 | (code >>> 12), 0x80 | ((code >>> 6) & 0x3F), 0x80 | (code & 0x3F))
    else
      out.push(0xF0 | (code >>> 18), 0x80 | ((code >>> 12) & 0x3F), 0x80 | ((code >>> 6) & 0x3F), 0x80 | (code & 0x3F))
  }
  return out
}

/**
 * 字节压缩：先放锁存，然后每 6 个字节当一个 48 位大端整数换成 5 位 900 进制（高位在前），
 * 不足 6 个的零头逐字节一个码字。48 位超出 Number 的安全整数不多，用 BigInt 算。
 */
function byteCompaction(bytes: readonly number[]): number[] {
  const out: number[] = [bytes.length % 6 === 0 ? BYTE_LATCH_EXACT : BYTE_LATCH]
  let i = 0
  for (; i + 6 <= bytes.length; i += 6) {
    let value = 0n
    for (let k = 0; k < 6; k++) value = value * 256n + BigInt(bytes[i + k]!)
    const words: number[] = []
    for (let k = 0; k < 5; k++) {
      words.unshift(Number(value % 900n))
      value /= 900n
    }
    out.push(...words)
  }
  for (; i < bytes.length; i++) out.push(bytes[i]!)
  return out
}

// ── GF(929) 里德-所罗门 ──
// 素域：加减乘直接取模。生成多项式 g(x) = ∏ (x − 3^i)，i = 1…k；纠错码字是 −(D(x)·x^k mod g(x)) 的系数。

const generators = new Map<number, number[]>()

/** 生成多项式的系数，高次在前，首项 1。 */
function generator(k: number): number[] {
  const cached = generators.get(k)
  if (cached)
    return cached
  let g = [1]
  let root = 1
  for (let i = 1; i <= k; i++) {
    root = (root * 3) % GF
    const next = Array.from<number>({ length: g.length + 1 }).fill(0)
    for (let j = 0; j < g.length; j++) {
      next[j] = (next[j]! + g[j]!) % GF
      next[j + 1] = (next[j + 1]! + GF - (g[j]! * root) % GF) % GF
    }
    g = next
  }
  generators.set(k, g)
  return g
}

/** k 个纠错码字，紧接在数据码字之后的顺序。 */
function eccCodewords(data: readonly number[], k: number): number[] {
  const g = generator(k)
  const remainder = Array.from<number>({ length: k }).fill(0)
  for (const word of data) {
    const factor = (word + remainder[0]!) % GF
    remainder.shift()
    remainder.push(0)
    for (let j = 0; j < k; j++)
      remainder[j] = (remainder[j]! + GF - (factor * g[j + 1]!) % GF) % GF
  }
  return remainder.map(r => (GF - r) % GF)
}

// ── 尺寸 ──

/** m 个数据码字、k 个纠错码字铺 c 列要几行。 */
function rowsFor(m: number, k: number, c: number): number {
  let r = Math.floor((m + 1 + k) / c) + 1
  if (c * r >= m + 1 + k + c)
    r--
  return r
}

/** 在允许的行列范围内，挑宽高比最接近目标的那一档列数。 */
function pickColumns(m: number, k: number, forced: number | undefined): { columns: number, rows: number } {
  if (forced !== undefined) {
    const rows = Math.max(MIN_ROWS, rowsFor(m, k, forced))
    if (rows > MAX_ROWS)
      throw new RangeError(`内容要 ${m + 1 + k} 个码字，${forced} 列放不下 ${MAX_ROWS} 行`)
    return { columns: forced, rows }
  }
  let best: { columns: number, rows: number } | undefined
  let bestDistance = Number.POSITIVE_INFINITY
  for (let c = MIN_COLUMNS; c <= MAX_COLUMNS; c++) {
    const rows = rowsFor(m, k, c)
    if (rows < MIN_ROWS)
      break
    if (rows > MAX_ROWS)
      continue
    const ratio = (17 * c + 69) / (rows * ROW_HEIGHT)
    const distance = Math.abs(ratio - PREFERRED_RATIO)
    if (best === undefined || distance <= bestDistance) {
      best = { columns: c, rows }
      bestDistance = distance
    }
  }
  if (best === undefined) {
    // 列数拉到最大也不到 3 行：按最少行数铺
    return { columns: MIN_COLUMNS, rows: MIN_ROWS }
  }
  return best
}

/** 把一个图案的 len 位铺进一行模块。 */
function paintPattern(line: boolean[], at: number, pattern: number, len: number): number {
  for (let i = 0; i < len; i++)
    line[at + i] = ((pattern >>> (len - 1 - i)) & 1) === 1
  return at + len
}

/**
 * 编码入口。内容超出 929 个码字时抛 RangeError。
 * @example
 * pdf417Encode('Hello') // 6 个字节 + 锁存 = 6 个码字，2 级纠错 8 个，加长度描述符 15 个码字
 */
export function pdf417Encode(text: string, options: Pdf417EncodeOptions = {}): Pdf417Matrix {
  const bytes = utf8Bytes(text)
  const data = byteCompaction(bytes)
  if (bytes.some(b => b >= 0x80))
    data.unshift(ECI, ECI_UTF8)
  const level = options.level ?? pdf417RecommendedLevel(data.length)
  const k = pdf417EccCount(level)
  if (data.length + 1 + k > GF)
    throw new RangeError(`内容 ${text.length} 个字符要 ${data.length} 个码字，加 ${k} 个纠错码字超出 PDF417 的上限 929 个；截断会得到一张扫得出、但内容是半截的码`)
  if (options.columns !== undefined && (!Number.isInteger(options.columns) || options.columns < MIN_COLUMNS || options.columns > MAX_COLUMNS))
    throw new RangeError(`PDF417 的数据列数要在 ${MIN_COLUMNS}–${MAX_COLUMNS} 之间，收到 ${options.columns}`)

  const { columns, rows } = pickColumns(data.length, k, options.columns)
  const padCount = Math.max(0, columns * rows - k - data.length - 1)
  const codewords = [data.length + padCount + 1, ...data, ...Array.from<number>({ length: padCount }).fill(PAD)]
  const all = codewords.concat(eccCodewords(codewords, k))

  const width = 17 * (columns + 3) + 18
  const modules: boolean[][] = []
  let index = 0
  for (let y = 0; y < rows; y++) {
    const cluster = y % 3
    const base = 30 * Math.floor(y / 3)
    const rowInfo = level * 3 + ((rows - 1) % 3)
    let left: number
    let right: number
    if (cluster === 0) {
      left = base + Math.floor((rows - 1) / 3)
      right = base + (columns - 1)
    }
    else if (cluster === 1) {
      left = base + rowInfo
      right = base + Math.floor((rows - 1) / 3)
    }
    else {
      left = base + (columns - 1)
      right = base + rowInfo
    }
    const line = Array.from<boolean>({ length: width }).fill(false)
    let at = paintPattern(line, 0, START_PATTERN, 17)
    at = paintPattern(line, at, pdf417Pattern(cluster, left), 17)
    for (let x = 0; x < columns; x++)
      at = paintPattern(line, at, pdf417Pattern(cluster, all[index++]!), 17)
    at = paintPattern(line, at, pdf417Pattern(cluster, right), 17)
    paintPattern(line, at, STOP_PATTERN, 18)
    for (let h = 0; h < ROW_HEIGHT; h++) modules.push(line)
  }
  return { columns, rows, level, width, rowHeight: ROW_HEIGHT, modules }
}
