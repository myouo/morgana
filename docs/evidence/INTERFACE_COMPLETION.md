# 原作设置、历史与消息隐藏（2026-10-30）

SDK生产提交1210638、8d19155，实包SHA256 `7936d45c910b7a7f5a595ddde2553a0f4bd35197950a2acaf43d481b4db2294d`。实例仅消费实际tarball与公开exports。原资料/生成物/日志仍ignore，安装目录只读。

原config的已读字速与两个nonstop独立持久化。普通开关也作用于已读，已读开关仅额外跳过已读段落的可忽略行内确认，页末仍等待；强制确认不能被绕过。八语按钮、复选框和滑条按各语言源参数：欧美/韩字速0–100、自动400–4000，日中0–40、400–2000；保留已有超出原滑条范围的合法用户值。原Default重置原控件，不回写Web附加偏好。

历史使用SDK公开HistoryText，保留字号比例/斜体/Ruby与源允许红/蓝色，其他颜色白色；按源角色键避免逐页重复名字，保留居中提示，16px/25px及无额外段间距。阅读右键和QuickMenu隐藏文字/消息框，首次点击或滚轮仅恢复；菜单/确认框右键只取消顶层。章节回放复用同一Player策略，主进度与临时播放隔离。

无框合成图片进入独立PresentationAssetCatalog，与Core使用同一资源缓存、摘要/尺寸/事实及驻留预算；不执行脚本、不增加剧情解释器。八语各19个映射、8个独立显示图片，其余目标复用已有资源。加两张复选框共新增10个物理对象，总发布920对象220540963字节。纯显示引用不会把既有剧情路径重新提升为shared。与上线前冻结副本相比，八语Program、ReleaseManifest、ProgramTextCatalog共24文件逐字节一致，无须改写旧剧情槽位/解锁签名。

SDK继续保护当前/候选/加载/音频/捕获/前看租约。eager的剧情资源由原租约保留，已释放的临时显示图片可在空闲后回收；真实浏览器验证取消迟到lease只归还一次、坏摘要/事实/驻留超限保留原切点，以及恢复显示后的临时图片释放。HTTP provider仍只持有目录；万指令样本复测额外持有496字节（Chromium156受控堆采样），不是浏览器/OS总RAM。

命令与范围：

- SDK：`pnpm check`、`pnpm test`：362单元；`pnpm build && pnpm build:harness`后完整Playwright217项通过；`pnpm test:package`：268文件/590928压缩字节，无游戏、日志、证据或私有来源。compatibility只通过合成格式，原档仍未认证。
- 实例：`pnpm convert`八语全转换、`pnpm build`严格类型/边界/PO与发布闭包通过；冻结副本对比见ignored `artifacts/interface-completion/release-invariance.log`。
- `pnpm test`首次91/92通过，唯一失败为旧菜单资源断言把新增configLayout对象当字符串；补充布局/复选框PNG/显示图摘要断言后，`pnpm exec tsx --test tests/menus.test.ts`两项通过。八语完整第一门、解锁与保存切点均已实跑。共92项Node与3项Python得到通过结果，没有删断言或跳过测试。
- 真实浏览器检查原始记录、trace、截图在ignored `artifacts/interface-completion`。日/韩首次标题音频激活在并行负载下超出原15秒准备界限；SDK全量结束后保持相同断言与时限单独通过。本地共21个唯一用例通过：首轮16、独立复验日/韩及原首页4、完整OP后回放隐藏1。回放初版测试误用禁存标题capture，后改只读PlayerView；计时驱动按实际任务余量走完OP，没有缩短剧情或修改产品等待。

F-01F新增有限条件编译：lower-conditions只识别来源实际使用的 `sf.fataend ==/!= 1`，输出标准SDK profile表达式/branch/jump；未知表达式、孤立/重复分支、深度/锚点冲突拒绝。八语前置间章/完整scenario2的32个新档和通关态组合，在预算1/100下与原静态分支筛选一致。这里的动作是计数标记，验证条件控制与保存闭包，不声称图片/音频动作已经降低。第二门及memory1选择支线尚不可玩，noise/heartbeat/eyecatch、角色/演出闭包与高级模块组合继续独立完成；不抬单函数/资源预算掩盖缺口。

原生tft/原作逐像素、历史全部原生断行分组、真机长期/多浏览器与原生存档仍未认证。运行`pnpm dev`；预览test.morgana.love、自动化testsdk.morgana.love，限速仅CDP。原始游戏文件与登录资料不提交。

独立回归Worker版本40783f5b-e73a-4e37-a7d9-a437ecf321e4；新增10个R2对象共3680815字节经认证回归域逐字节核对。Python默认UA首轮403，沿项目既有probe UA复验通过；未改鉴权/Worker规则。`MORGANA_RUN=interface-completion ...playwright.remote.config.ts`九项公网回归全部通过（3.4分钟）：英/日设置、英/中旧整章槽隐藏/恢复、逐次滚轮/历史/循环翻页/偏好、真实BGM与PB压缩字节。预览最终版本3577a49c-dbb3-4e41-84e8-b74cd7a5cee1。

SDK接续提交a792913cfb415907defa3d713ba3a084c9fc6dff已正常快进推送main；`pnpm sdk:build`在该提交上重现实包同一SHA，依赖没有因文档更新漂移。SDK完整可达历史未见真实原包/解包KS/TJS/游戏生成目录；远端基线既有通用测试日志按保留SDK历史的要求保留，本次29个变更路径均为源码/短文档，无新增日志或载荷。

`pnpm preview:check`：109个静态文件41985851解码字节与本地dist一致，匿名预览200、R2 Range通过，回归匿名401。无时钟模拟/无网络节流的全新匿名Chromium实际打开设置和原开始流程，0个页面错误/401；一个Pixi舞台和其既有背景分层输出正常（冒烟初版误把两个输出Canvas当重复舞台，核对SDK stageZ结构后修正验证）。预览/回归发布目录及Worker继续独立，SDK/实例只推main，实例仍一个无LICENSE根提交；游戏载荷/凭据/日志不进Git。
