# F-01E：完整新周目序章实际接入

2026-10-28。程序范围是44段前导/OP、22页序言及zero2→scenario1start新周目序章。两条问候路线各93页；正文候选95页（意大利语96），不是把全部分支依次播放。八语独立PO/control/source身份，原稳定标签和语言独有拆段保留。原宏指纹变化、未知条件/指令/参数明确拒绝。

真实接入女仆部件/表情、正常对白/原姓名图、炉火buf1与脚步buf0、源绑定BGM/SE淡出、静态前后台页/规则图/场景转场及原选择命中区/音效。没有另建KAG VM，所有剧情由实际tarball的正式SDK执行；React只提交输入。源日文没有autosave，其余七语选择处写4循环自动槽。框/姓名仍静态合成，隐藏框未启用。

SDK da7a077，实包SHA256=fc5c2315f4ce7073daba0e5287065c74eb9e0fedd844045e4917be42354ea441。ADR0049自动点过滤和空窗口主题字体继承已通过check、46文件289单元、10保存/字体浏览器、strict consumer；CI run40700039576六任务success。包不带作品/证据/日志，实例通过公开exports消费，未覆盖主SDK并行工作区。

本地实际命令：pnpm convert、pnpm build、pnpm check、pnpm test通过（3 Python+57 TS）。生产Core覆盖8×2源路线，交替预算1/8/100，每条在8/40/70页protobuf捕获重建。全部46项浏览器覆盖已通过：首轮45通过，po-rich夹具仅换剧情却遗留源自动点，严格SAVE_AUTOSAVE_POINT正确拒绝；补齐其metadata后单项复验通过，未放宽生产校验。新序章9项浏览器覆盖八语及中文两选择、45页保存/刷新/读取、逐页文本/姓名/溢出、真实BGM/SE与自动槽。旧32页真实版本快照升级测试通过：保留存档并显示不兼容，未猜测迁移。原菜单、移动视口、OP音频实采样、后台、流式、滚轮/快捷栏/四种读档历史均回归。

R2闭包472对象117584497字节。新增/变化102对象41682786字节均实际HTTPS摘要核验；370对象逐项本地身份核对并复用上一378对象部署证据。旧资源不删除。HEAD、Range、suffix、条件请求、版本失败、404/405/412/416与鉴权边界通过；HTTP传输错误保留有限重试记录，不忽略HTTP状态或摘要差异。

网络首轮未全绿：3项通过、6失败、1主动中断、8未运行。多数失败在原Ogg尾部Range/初始准备15秒；未把失败记为已验证。排查还发现每个缓存命中仍回R2.head及Range绕过缓存，已按RANGE_CACHE实现有界完整响应缓存、缓存元数据和Range。pnpm cloudflare:check与pnpm test:edge（真实本地workerd/R2/Cache）通过；改后公网HEAD-HIT/RANGE-HIT字节/条件/暖缓存401均通过。

三并发回归另暴露两条整条用例180秒总时限；新测试包含44演出、93页、两次冷激活和图文保存，整体预算改300秒，所有15秒资源准备、5秒界面、10秒自动槽断言保持。该调整不计作性能提升；网络整体延迟仍按实测报告。最终18项网络覆盖通过：缓存元数据版本16项通过，另两条完整路线按新整体预算单独复验通过（实际1.9/2.5分钟），未扩大单资源边界。冷法文标题传输2525615字节，仅选中语言；OP收到220382/5122568字节时已playing，实际HEAD与4个206响应。原网络抖动/失败证据保留，不宣布公网稳定性已彻底解决。

原始日志/报告/截图/trace在ignored artifacts/prologue及artifacts/remote；旧版32页资料在private/compat32，只用于真实升级验收。文本在locales/<BCP47>/story.po、prologue.po、choices.po、ui.po；awakening.po保留历史，chapters/为全部分支研究候选。原KS/TJS/解包/音图字库/构建载荷/凭据不进Git。

F-01E继续in_progress：第一门15场景、通关变体、原章节解锁/回放菜单、复杂角色/环境运动、tft/原作行为对照及原档互通未完成。精确下一项为女中_右体空图层/角色生命周期和位置模型，然后整体编译scenario1start→zero3，在真实章末标记sf.scenario1并以同章函数隔离回放。

回归站最终Worker c15f19a0-c6a3-4da3-b772-a51c1547183f，frontend入口SHA256=cbe2ea146549c14d62f968085f694e164b608da30a35413a13b53e05e2edbbe7。匿名预览cd735bb7-7bb0-4fb2-922b-a5961e1d78bd；52文件5013691解码字节逐一匹配本地dist，匿名入口与媒体Range通过、回归站仍401。预览未加限速。

交付后SDK CI跟进：0bb73f4的两项默认UI用例失败（输入光标/读档首点击）。eb11b90改用layout effect初始化焦点与手势，check、原两例各6次、presentation/stage/save-system全部19项、strict consumer通过。新包06efd13b7f452f76c1f206792798e8669bc01fa321d534eaa5881c6c6d354331已独立安装；pnpm build后52个前端文件与此前部署逐字节相同，原序章/网络证据继续适用，未改变Program/存档身份。SDK原失败及修复证据见galbox/docs/evidence/ui-initialization/REPORT.md，当前源码CI另核对。

2026-10-29 SDK CI续验：4afbeb2保留原五秒stage断言，直接读取同一诊断DOM，stage三项各3次通过；该提交CI原先的stage/焦点分片已通过。未改动的Canvas流程图出现一次locator等待总时限失败，本地3次4秒左右通过，同生产代码的前版Canvas分片亦通过；只重跑该失败分片，首次失败保留，不声称测试无抖动。

最终SDK核验：最终源码/测试提交4afbeb2，CI run40721872087 attempt2六任务success，浏览器22+44+43+34+38=181项；check包含289单元、CLI、consumer、release和package检查。首轮Canvas流程图locator超时及本地3次复验保留，未以复验结果抹掉首次失败。 实例锁定4afbeb2之后的文档归档tip，06efd13b7f45实包已复现，生产与测试源码相同。此次仅文档归档不重新运行完整代码CI；已验证代码、测试、超时和断言未改变。

2026-10-29后续加载/自动迁移/正文续段升级的当前运行时验证见READING_LOADING.md；本报告中的46本地/18线上属于此前版本历史证据，不冒充新运行时全量实例复验。当前源码文本/资源身份保持，最终SDK全量CI和实例实际复验范围按新报告列明。
