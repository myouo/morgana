# 二门第一批可执行内容（2026-10-30）

F-01F继续，不标整章完成。SDK新增通用step-end时序（生产a9ef9b9/ADR0073），实例实际tarball SHA256 `bd497859ad58c80dd808cde1cf6ea0c2bdfcd840736c18db6f1f85ad10a70a63`。只使用public exports、标准Program/protobuf、正式Core/Player；KS/TJS只解析为数据，原安装只读。

八语Program均从完整第一门接scenario.ks *zero3间章，再到scenario2 *start至*second4之前。开发gameId、series及IndexedDB与正式实例隔离，不改旧槽，也不提前写sf.scenario2通关flag。

| 语言 | 间章源段 | 二门源段 | 函数数 | 新文本切点 |
|---|---:|---:|---:|---:|
| en |79|352|127|425|
| fr |79|352|127|425|
| it |80|351|127|424|
| ja |79|355|128|423|
| ko |79|353|128|429|
| pt-BR |79|352|127|425|
| ru |79|352|127|425|
| zh-Hans |79|354|127|425|

源候选段包含通关态条件和自动文本，不能把总数当新周目输入次数。八语实际Core均跑过第一门→间章→二门片段，逐个核对源正文及自动历史、确认数和保存重建。英/中原生p分别401/403，与编译确认相同；葡语402，包括一个额外强制inline confirm，不重复正文/历史。er清字后分配独立文本身份，避免错误复用已清空的continuation。新周目不写原通关态专用fataend_scenario1。

图层/角色/音频编译状态跨章共享；支持本批角色、分数站位/固定、图片清空时保留部件数据、参数化静态演出宏、音效渐变、带色闪白、心跳的前后台副本。心跳使用空闲插件平面进入同一整页转场，按源500ms缩放/淡化与末端切换；活动pose先replace/finish再重置，不能在组合中插入外部根或抢写。未新增剧情解释器或宿主回调时钟。

实际命令和结果：

- `pnpm sdk:update`安装实包；最终`pnpm sdk:build`重现相同包。SDK check、363单元、4相关浏览器（新step-end两后端+原opacity-motion）、包审计268文件591268压缩字节通过。不是217项全量重验。
- `pnpm chapters:convert interlude1 --staging`、`door2 --staging`已有；新增`memory1 --staging`提取八语各68段和完整返回控制，仅为数据准备，未链接可玩支线。
- `pnpm chapters:build <locale> second4`八语编译/字体覆盖通过；`all-locale-validation-confirm.log`通过真实Core初始切点、每个资产实际字节及正式verifyReleaseManifest。单函数/Program/资源预算均未提高。
- `pnpm chapters:verify <locale>`：八语完整链路、源文本/确认、四个保存重建切点通过。headless显式虚拟媒体回执；浏览器另验真实设备。驱动初版误把通关flag当新档flag，按源if修正测试，没有强写flag。
- 每语原第一门101个执行函数与正式版一致；英文当前工具重建得到相同Program SHA256 `8818c5a0923ac39a50fe60d7e787dded78982575941ec0240d3bc80b4f9892b6`。字体相关姓名图缓存按字体内容摘要失效，避免重复外部渲染。
- 适配相关原8单元和新4单元通过；`pnpm check`及独立游戏入口严格TS检查通过。静态宏调用的表达式参数明确拒绝；不使用eval。
- `pnpm test:door2`中英4个真实浏览器通过（1.8分钟）：实际图像/正文、图文IDB跨刷新、心跳250ms活动切点保存/刷新并到500ms后透明。初版平面交错和活动pose写锁在真实Core暴露并修正，未放宽SDK拒绝规则。源码/图片核对与浏览器结果不冒充原exe逐像素认证。

本地入口：本工作区已准备好数据，运行`pnpm dev:door2`，访问`http://127.0.0.1:4182/?lang=zh`（en/fr/it/jp/ko/pt-br/ru/zh）。首次从真实Core生成的间章切点载入；F5/F9及原样菜单存读档，后续刷新继续已有槽。局部入口没有原完整标题/鉴赏，回标题控件禁用。界面不展示实验说明/诊断或SDK工具栏。

重新生成先完成普通原资料/第一门准备，再执行staging PO、chapters:build及chapters:verify；生成后再跑浏览器，不边写载荷边测试。所有原资料、PO暂存、程序/资产、截图/trace/日志/备份切点均在ignored private/public/generated/artifacts。正式可玩预览仍为上一版已验收第一门，未上传或替换为此未完成片段。

下一：函数已达127/128（日韩128），需在SDK落实W1-03B2高级模块闭包与生产者规模，再接二门其余场景、旧电影等演出、memory1选择/返回及scenario3边界。仍有明确差异：动画glyph、CJK首行65px定位、独立hisout历史注记、脚本禁文字揭示/取消快进未完全映射（定时/组合等待的不可跳过已执行）；blur/采样栅格化、原生tft/原作像素/真机长期未认证。这些缺口写在转换报告，不在游戏视图添加诊断。
