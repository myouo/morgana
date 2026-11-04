# 第六门主线与限时选择（2026-11-03–04）

## 实现与源依据

第六门及第四坏结局的八语源数据静态转换为正式 SDK Program/protobuf。
已发布第五门终点经显式一次续接进入第六门；正常路线止于 search2.ks
（第二次调查入口），超时路线进入 badend4 后返回标题，不代表第七门或整作完成。
原章节书第四页保留第五门，并按 scenario6 解锁第六门；同一章节体在 SDK
临时回放会话运行，关闭不改变主线状态。新增原源码书签和联合字库。

源场景仅有一个限时选择。严格核对三段 iscript 的有限文字结构：1000ms
计时器、第二次 tick 跳入否定できない、两路都销毁计时器。解析器不执行
TJS。降低为 SDK interactionPrompt 2000ms 活动期限；原图片按钮 ready 后
激活，由 SDK 判定点击/超时/旧输入，保存保留剩余活动时间。Native Timer
墙钟/设备调度与网页活动时钟的逐帧相等未认证。

带 autosave 的译本映射到紧接着的合法正文提示点，报告显式写出
AUTOSAVE_SEMANTIC_PROMPT。源宏的提示前即时截图与保存铃声尚未在原位还原，
不能据此宣称逐像素与原生保存切点完全相同；读回不重复产生自动修订。
日语该段源没有 autosave，按自身源保留。badend4 的无标签段落跨译本存在
对齐阻断，各语保留自身文本身份，未按行号强制拼接。

输入固定 generated/fifth-public。保留既有不可变代码和资源、旧迁移来源链。
第六门供体的叶函数先经正式 SDK 展开，按源标签拆分长场景，未提高256函数
及函数大小/执行预算。组合使用33项已有能力，SDK W1-12/ADR0111把元数据
声明数上限对齐43项现有注册表；未知能力和44项仍拒绝，没有删掉能力声明。

真实浏览器先暴露隐藏图层全部解码造成64MiB驻留预算拒绝。SDK W1-13/
ADR0112保留全部逻辑图层/任务，在真正显示前准备纹理；隐藏父级同时影响
子级，alpha淡入仍准备。旧帧与新可见资源依然需要同时满足预算，准备失败
保持旧画面/持久head，实例没有复制引擎实现或增加资源预算。

## 已执行验证

- `pnpm door6:build all`、`pnpm door6:verify all`：八语完整正文及两条路线。
  中文1824文本片段；八语1823–1827片段，独立按各语源核对。
- `pnpm door6:connect all`、`pnpm door6:verify:main all`：从实际第五门旧终点
  继续，逐段遍历、冷切点恢复和独立章节入口；最大78对象/111任务。每语
  保存章首/中段/限时prepared与750ms活动/正常终点/坏结局，带自动保存
  的译本另存提示前和提示点。1999ms点击成功，2000ms超时后旧点击不覆盖。
  媒体回执来自显式虚拟Host，不代表整章物理音轨验收。
- `FATA_SCOPED_ROOT=generated/sixth-connected pnpm exec tsx tooling/verify-scoped-save-cuts.ts all`：
  135历史切点通过，每个至多6模块；`pnpm exec tsx tooling/verify-sixth-old-cuts.ts`：
  40个实际第五门切点通过。原档DTO、帧、文字、任务时钟保留。
- `pnpm check`、`pnpm test`：121 Node、7 Python通过，包括实际八语计时声明
  的正反例、模块重定位及迟到输入拒绝。

首轮17项物理浏览器有16项通过，自动保存失败：异步缩略图期间演出触发
资源准备，随后flushAll正确拒绝未提交目标，暴露捕获/进度刷入顺序竞态。
SDK W1-14/ADR0113将同切点进度刷入放在thaw前，缩略图仍在屏障外等待；
27项既有存读档/加载浏览器与1实际延迟图像/资源交错用例通过，SDK450单元、
最终严格类型、278项浏览器分片枚举及独立打包消费通过。实例重新实包验收、
发布与延迟测量仍在进行中，待补实际结果。原生glyph/
音轨seek/全通变体/逐像素/原档codec保持未认证；便携备份100万JSON字符
上限不变，不截断长期已读或历史。日志/源KS/TJS/素材/切点仍ignored。

最终SDK来源3569c77244c570249dce9b34a9116c5933e9ea14，实际依赖tarball
SHA256为7bcf2efa0a7fed7d158cbdf4a23b15719ede4e7babc96ecbcc9aefc838190f0e。
新版完整浏览器曾通过前12项（含自动保存），随后执行环境以143/SIGTERM中止，
未生成完整报告，不能视作整套通过。改用Playwright原生3分片，各批实际运行
后合并blob报告；全部17项仍是发布门槛，没有删断言或把部分报告凑成成功。

## 本地候选通过（2026-11-04）

`FATA_SIXTH_RUN=local-shard-1 PLAYWRIGHT_BLOB_OUTPUT_DIR=artifacts/sixth-connected/local-shard-blobs pnpm test:door6 --fully-parallel --workers=2 --shard=1/3 --add-reporter=blob` 通过6项。
第二批同命令设`FATA_SIXTH_RUN=local-shard-2`、blob目录`local-shard-blobs-2`、
`--shard=2/3`；第三批额外`FATA_SIXTH_PORT=4200`，run/blob后缀3，
`--shard=3/3`。后两批独立端口同时运行，分别6/5项通过。
按实际zip复制到local-merged-blobs后，
`pnpm exec playwright merge-reports --reporter=json artifacts/sixth-connected/local-merged-blobs`
合并报告expected17、unexpected/skipped/flaky均0。第一批源自11月3日，后两批
源自11月4日；期间程序/SDK/测试断言未变，新增端口选项只用于并行测试。
不能将包含隔夜间隔的合并duration当实际执行时长。

`pnpm door6:stage`、`pnpm door6:promote` 通过，2769个私有SHA资源/
610413818字节；新增303文件、保留3698、旧文件删除0，正式目录没有测试切点。
整合为253–254函数/43–47模块，八语新切点共62个。已人工查看开场、
限时选择及原Chapter V/VI章节页截图，未据此声称原作逐像素认证。

## 最终独立耗时

`FATA_SIXTH_RUN=serial-library pnpm test:door6 -g 'sixth-door full progress' --workers=1`
通过。保留15992已读和完整上一修订，40次图文保存332–483ms，中位351ms；
刷新读回通过。此前四浏览器同时运行的第二分片保存480–2850ms，中位863ms，
作为并发负载样本保留，不当独立延迟基准，也没有删进度来降低容量。

正式提升目录重新生成实际旧/当前调查档后，
`FATA_LOAD_RUN=sixth-final pnpm exec playwright test --config playwright.performance.config.ts load-profile.spec.ts -g auto`
通过。无CPU采样的WebGL样本：当前调查档冷1904ms、热501–522ms；旧档
迁移冷2968ms、热665ms。均完成Core/画面/媒体接管与持久确认，终点为
search-places:wait；此样本不代表第六门每个场景或所有公网请求的耗时，首次
冷读仍未全部低于1秒。测量期间没有并行构建、上传或其他浏览器回归。

## 发布准备

实例实现提交9d76ba4。`pnpm build`通过；两套隔离前端目录各2402文件，
均无测试切点，入口SHA256同为605ae912d855f78d78ac9005a6e4d9da128fdaaebb05ecace2ceec28138014d4。
`FATA_PUBLICATION_ROOT=generated/integrated python3 tooling/upload-r2.py --bulk --oauth`
成功上传192新对象/31962050字节（179 PNG、9 OGG、4 TTF）。
`pnpm r2:verify`核对完整2769对象闭包：789个既有不可变证明复用、
其余1980中192本次抓取、1788续验，失败0。R2保持私有SHA对象，共享媒体
与两个Worker/前端目录继续隔离；没有在预览、Worker或R2加入限速。

## 第六门公网关键验收

回归部署be7858e1-5fb7-4724-9991-ca130da459aa。按用户新增的整体进度优先
要求，采用必要公网切点复核；本地已通过的八语17项不再全量公网重复。
`FATA_SIXTH_ORIGIN=https://testsdk.morgana.love FATA_SIXTH_RUN=remote-critical pnpm test:door6 --fully-parallel --workers=2 -g 'zh fifth endpoint|zh source timed choice timeout|authored autosave prompt'`
通过3项：旧第五门终点续接/图文刷新、限时超时路线、自动保存及读回不重复。
`FATA_INTERFACE_ORIGIN=https://testsdk.morgana.love FATA_INTERFACE_RUN=sixth-remote-compat pnpm test:interfaces --fully-parallel --workers=1 -g 'source load confirmation|en SDK chapter menu'`
通过2项：原载入确认/刷新，以及英语章节/结局列表/隔离调查回放。两进程
同时运行；没有故障/限速注入。公网重复读取在此负载下为4331/5307ms，
明显慢于本机独立样本，作为待处理网络差异记录，未宣称公网全为1秒。

预览部署9cae95e8-d0e6-474e-8f95-b3ce0b606e24。`pnpm preview:check`通过：
2402文件/929711748解码字节逐文件等于本地dist，匿名/媒体Range/回归鉴权
隔离通过，无流量整形。两次普通传输中断按既定策略重试成功，摘要/权限
断言未放宽。用户新增持续目标后，后续转入第二次调查至终章/通关内容，
非阻塞差异集中到REPLICA_GAPS；六门源数据与发布产物保持冻结。
