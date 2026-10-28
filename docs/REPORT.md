# 本轮最终实现（2026-10-28）

贡献者直接编辑locales/<BCP47>/story.po或ui.po；locales.toml定义默认/名称/别名，controls.toml保护原作换行/点击控制。固定gettext-parser 10.0.0/类型9.0.0、smol-toml 1.9.1。外部输入先校验，再匹配稳定TextId与英文来源；重复/缺失/空/fuzzy/控制错误拒绝。转换器在字体子集前应用PO，修正页Revision改变，未改页面保持；build重新发布并拒绝新PO/旧Program混用。Core不解析PO或执行翻译中的脚本。

当前16个PO文件、8语言各22页和26个UI标签。3 Python+24 TS通过，包含修改PO→正式Builder→split/protobuf/bind→实际Core/保存恢复及失败反例；GNU msgfmt --check全部通过。8语言真实转换/字体覆盖/资源闭包/两恢复切点、strict/build、本地3网络浏览器通过。重复发布全目录指纹8907282bc3390896c94f70dd6a6520e187b4daaef3693d49f646feb189ecd9e2保持。

test.morgana.love是本地build预览，testsdk.morgana.love为独立Worker和发布目录的回归环境。两者私有R2绑定共用不可变SHA资源，只允许读取；速度限制仅存在测试CDP。旧构建两个域名均20浏览器通过；PO新版已部署，最终20项回归全部通过（8.6分钟，零失败/skip/flaky）。预览版本512394da-2465-4f27-8df3-703dbde953b9，回归版本eff76469-9112-417f-ad08-06d85611d341。最终结果见后续证据回填。

用户授权代码推myouo/morgana、SDK推myouo/galbox；实例为一个新根提交，移除旧LICENSE。原包/解包KS/TJS/二进制素材/凭据/日志不进入GitHub；仅经整理的PO文本允许提交。下面保留历次检查事实，旧版本和未完成说明以本段和STATUS为准。

# R2与多语言隔离验证（2026-10-28）

本轮使用独立SDK包7873ffcbf4c082a75c2b2655ba27cfd22800080d6c72d90247b79c2df18f7355，234文件518051字节。8语言剧情/UI拆为protobuf目录，绑定后Program字节一致；真实转换Core/两恢复切点与整个资源闭包通过。当前发布从实际引用重建，304资产64355598字节，分shared/BCP47语言路径；不复制旧public孤儿。语言设置确认后回标题，同步文字/字体/美术/偏好，语言存档继续隔离。

实际建独立R2桶并部署受保护test.morgana.love；桶公开入口/Worker开发域名关闭。304对象通过公网逐字节摘要，HTTP范围/条件/失败/鉴权与预热HIT均验证。Cache-Control大小写对象键拼接导致MISS已修复；完整复验64 HIT/240 MISS，后续连续HIT，匿名仍401。Worker直接传body流，登录secret只在ignored private/Cloudflare secret。

`pnpm check`/3 Python+21 TS/构建、Worker生成类型与strict通过；本地13整体浏览器通过。线上原八语言聚合180秒/跨语言存档90秒达到总时限，按真实网络保留全部断言拆语言/调整多次冷启动总预算；旧ResourceTiming零值度量失效，改CDP且要求非零。最终线上20项仍执行，完成后回填。独立冷网复验8.9秒，CDP编码响应3647450字节/23请求/7媒体，只当前法文与共享资源，SDK驻留估算16877703、峰值18309982字节。

原曲仍完整摘要Blob，64MiB只是SDK设备估算；未认证渐进OP网络流、离线/真移动/Firefox/Safari/整作与原档。操作见deployment/README.md；raw仅ignored artifacts。以下为上轮历史报告，对应其原基线，非本轮包散列。

# 首页、浏览器交互与后台播放验证

2026-10-28，实例基线7a0364e，SDK对应本地提交149c2d6，真实tarball SHA256=135464bdfce17645fe8acc23e399fdfbcc4394bfde706dbda51b8becb60e312a。冻结锁/strict/skipLibCheck=false与边界通过，路径在本工程node_modules/.pnpm，不使用SDK源码。原素材/脚本/字体/public/vendor/证据载荷全ignore，无推送发布或exe逆向。

## 首页与系统接口

首页按照原title_main全部可见按钮生成命中区与进入音；开始仍走原Core choice，读取/设置在已等待的标题Core之上打开，不重开剧情也不暂停标题音乐。菜单美术从原config.ks/SliderControl/saveload源参数解析，URI为真实内容摘要；不执行TJS。读取4卡布局、原背景/卡框/返回按钮；保存与读档均走Player正式原子提交/激活。系统Esc菜单可真实保存/读取/设置/确认回标题，确认读取不通过React修改PC。

设置提供真实音量/正文速度/瞬显/自动等待/后台策略和恢复默认。复选框曾因IDB异步提交前React回填旧值而闪回，现有乐观草稿、最终SDK持久值归位，失败明确提示；未禁滑条掩盖问题。已读速度暂明确显示与普通文字同速，没有假造独立支持。原固定槽位/保护/精确菜单转场仍待后续。

原homepage字面URL只接受http(s)/novect.net，noopener/noreferrer新开；测试拦截目的页，不实际向外发送资料。英文等版本退出确认后确实dispose/停止媒体，普通浏览器不能强制关闭页面，提供明确停止/重新开始交互而不假报关闭。原菜单Tab/Escape/取消与返回焦点验证保留。

## 浏览器行为与后台

原生contextmenu/selectstart/拖图阻止；全游戏user-select/touch-callout禁用，右键不推进或打开隐藏菜单。SDK新backgroundPlayback默认continue：失焦/隐藏关闭Auto/快进，演出/原曲保持，普通正文/静态选项等待输入，回来不自动恢复。严格暂停可选，用户/菜单/资源暂停不会被focus解除。隐藏250ms实例驱动使用同一coordinator，省略绘制而继续实际增益更新；后台计时受浏览器/OS限制。

开发server.hmr=false，防止源/资源更新导致页面重新挂载回标题；生产与手动刷新行为未伪造。开发验证实际写回main.tsx和程序资源，在原生OP中失焦后检查导航计数仅1、同epoch/token、逻辑时间继续和manual模式；Vite日志WebSocket可存在，真正检查无update/full-reload消息及无导航，不把连接数当重载。原资料/日志/vendor的实际文件路径HEAD都403。曾误测不存在/private/probe会走SPA首页，已改验证真实受保护源文件；未降低保护断言。

## 实际命令与结果

- check-homepage-final.log/check-handoff：类型与独立依赖/ignore边界通过。
- unit-homepage-final.log：3 Python提取器+20 TS通过，含8语言菜单资产实际哈希、未知动作/危险URI拒绝。
- convert-homepage.log：8语言44前导/176页/两恢复切点、完整生产Core与全部资源发布摘要通过。
- browser-homepage-all.log：完整10项通过。旧8语言/4:3/前导/正文/原曲波形/刷新恢复6项保留；新首页/设置持久与默认值/返回不重启、右键选择禁用、SDK图文保存→确认回标题→真实读取、后台OP同epoch/Auto退出、原链接/退出通过。设置与读取/正文截图已目视。
- node artifacts/verify-dev-continuity.mjs：dev-continuity.log及dev-continuity-op.log通过；无WebGL实际Canvas，OP继续，源文件/程序资源写入无自动重载，0 pageerror，三个敏感前缀实际文件403。
- SDK check/build/255单元、新3+原7浏览器/最后3复验/实包consumer/232文件包白名单通过，详见SDK evidence/g1-03。

raw日志/JSON/截图/trace只在artifacts和test-results，均ignore。没有以fixture、虚拟Host或固定成功对象冒充浏览器/持久化。

## 接续范围

当前仍仅前导+22页。G3-07处理旧曲按源淡出停止与多剧情SE buffers，之后普通对话/炉火与宏CFG；原click-skip、独立已读速度、完整菜单/槽位/保护、glyph/textfade、日中.tft、完整i18n、原档/global和原作继续参照未完成。源页面合成不代表通用TJS/KAG VM，未做完整墙钟AV/原版像素认证。旧槽保留，变更release无隐式迁移。开发关闭HMR后请手动刷新一次加载新版。

最终慢网复验：180ms/750000B/s只在testsdk测试浏览器模拟，11.2秒达到标题；CDP记录3647247编码响应字节/23请求，SDK估算驻留16877703、峰值18309982字节。预览52文件3964825解码字节与本地dist一致。
