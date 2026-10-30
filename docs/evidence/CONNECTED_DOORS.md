# 正式三门接续与旧模块存档

2026-10-31，F-01H。八语原标题/OP/完整序章/第一门→间章→完整二门及
memory1双分支→完整第三门21场景，结束于 `search.ks:*start` 调查入口。
正式本地4184已提升为doors123；4183/4185保留独立测试命名空间。
公开test.morgana.love、testsdk.morgana.love和R2本轮未重新发布。

SDK补齐W1-03B3A显式原ModuleProgram来源/双闭包迁移、G2-07源窗口矩形，
以及可选精确packedDeclarations。旧清单、旧代码和所有旧非main函数保持；
main只追加接续。旧档先按原来源验证，再映射完整目标快照并验证，最后
由SDK activation CAS接管。原槽/当前进度保留，未知版本明确拒绝。
章尾映射为同一main上的1ms接续等待；两分支共用第三门。源章头在黑场
重置表现，原音量保留；交接检查无运行视觉任务/BGM。没有第二套剧情VM。

源信件矩形以text.window.geometry表达，末写者进入保存闭包。原八个窗口
定义不改，旧段落布局保持。章节标题/历史展示索引拆为有摘要的小块，
保留原单块上限。所有完整地址/ABI/代码SHA继续验证，没有提高输入、
函数、窗口、能力、快照、纹理或64MiB驻留预算。迁移只缓存原清单；临时
旧代码不再由实例迁移注册表长期持有，原存档不作为内存回收对象。

实际验证：

- `pnpm sdk:update`：实际tarball SHA-256
  `7ae4655617e141c5c28dc80f3c3cee670221f835e0de72bf28feedde0a90c1fa`，
  与SDK独立消费验收使用的包完全相同。只使用public exports。
- `pnpm connection:build zh`，其余七语通过node/tsx循环调用
  `compileIntegrated(locale,{includeThird:true,outputRoot:'generated/connected'})`；
  `pnpm exec tsx tooling/split-title-views.ts all`完成展示小块，再用
  `loadTitleData`校验全部八语。每语1167资产，原第一门101函数逐字节保持；
  完整旧两门非main函数也逐字节核对。未知源指令/参数仍显式失败。
- `pnpm connection:verify zh`、`pnpm connection:verify en`：从原第一门终档
  出发，两种二门分支均到第三门结束。中remember/avert分别6689/6606文本
  片段，英6706/6623；每语另验6个原第一门切点。
- `pnpm connection:old-cuts zh`、`pnpm connection:old-cuts en`，其余六语
  node/tsx循环调用`verifyModuleCuts`：64个原两门切点按原闭包验证，再做
  目标模块冷恢复，文本/舞台/调用栈保持；两种旧终档均改为第三门接续。
- `pnpm test:connection`按三个grep分批执行，最终13个独立场景通过：中英
  旧普通页/选择页/两种终档、图文冷刷新、源信件几何、第三门隔离回放，
  及旧来源503时保留主线/旧槽并重试。故障断言使用标题画面只读状态；
  信件与回放拆成独立用例，未放宽保存策略。
- `pnpm test:connection:fit`：中9206、英9201页，共18407页，无滚动和
  字形越界；中文3页缩排，最小0.88623046875，英文0页缩排；每语10页
  信件按其实际源矩形核对。其余语种本轮没有重跑整合版全文DOM矩阵。
- 实例`pnpm check`、`pnpm test`全部109测试通过。SDK顺序check/407单元/
  10相关Canvas+WebGL/IndexedDB浏览器/严格隔离tarball消费/包审计通过；
  248浏览器分片发现通过，不称全部248执行。
- `pnpm connection:promote`：追加4552文件、核对保留3473文件，未删除
  原文件；稳定入口按临时文件rename提升。`pnpm build:integrated`通过，
  276个PB共169732828原始bytes，压缩为21055448bytes。

原始日志/切点/PNG/trace/验收清单均在ignored artifacts/module-upgrade、
artifacts/connection；原清单在private/compat-modules，载荷在generated/。
SDK证据见其docs/evidence/w1-03b3/REPORT.md。首次重建旧来源可使用
`pnpm integration:build all --previous`、`pnpm connection:freeze`，之后保留
已冻结来源。正常追加提交/快进推送main，不重写已发布历史。

边界：完整接续双路线本轮重跑中英；八语第三门独立完整路径/80冷切点和
有限效果的旧验收仍分列THIRD_DOOR.md。本轮不宣称完整整作、全部原作像素
或移动真机矩阵。调查章节及后续门、通关变体、原生tft、源输入限制/历史
注记/CJK首行定位/glyph仍待推进。长残像有限采样和固定种子旧电影保持既定
近似。SDK父项W1-03B3的模块recipe/SaveBridge/历史回溯仍明确unsupported；
代码驱逐/容量/持久缓存另列后续任务。
