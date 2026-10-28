# 完整第一门验收

实际工程独立消费SDK 3f4de2e、tarball SHA256 6e173f964f274913553eb74106fce822179f65d42be34442c842a68994edbbb2。八语由原KS控制/宏和可编辑PO生成标准Program，未增加旧脚本VM。正文、界面文本与共享/语言资产分开发布。

八语主线路径已全部通过真实Core执行：每种第一门2478–2481段，所有文本切片严格对应原顺序，七个中途protobuf保存恢复，正常章末sf.scenario1/成就与回放解锁。媒体在此组使用明确的虚拟started/ended事件，不充当真实媒体播放证据。`FATA_TEST_LOCALE=<locale> pnpm exec tsx --test tests/door-runtime.test.ts`；日志artifacts/door2/full-<locale>.log。保存切点通过正式MemoryStore生成PortableBackup，无手造快照。

`tests/save-migration.test.ts`改为实际新发布Program作为目标，旧32页/93页的八语正文、选择、结束以及活跃淡出共17项通过。迁移不删除旧槽，未知发行版仍拒绝；这不是KRKR原生tft存档互通。

实际Canvas浏览器已通过14项：八语原章节菜单、临时M-6音乐、同程序隔离回放及关闭后持久head/profile保持；真实花瓣、雨、双BGM、闪白、规则转场切点加载/图文保存；第500段存档刷新恢复和滚轮历史。截图、trace仅ignored artifacts/door2/browser，日志browser-cuts-replay.log。正常主线浏览器已到第500段，首次刷新在并行重载中超过就绪时间；实例现按原作只读历史关闭未用的回滚快照，保留64条历史窗口，Focused刷新测试通过；完整主线路径正在browser-whole2.log复跑，尚未标通过。

素材闭包910个文件、216860148字节，经本地SHA验证。R2首轮一个连接错误，失败项按不可变SHA补传后910项上传完成；HTTPS逐字节/Range验收在r2-probe-full.log进行，预览前端尚未发布。生产站不加带宽限制，网络回归仅testsdk。

源码差异：KAG默认exchange=false会复制目的页；同时对齐只等复制后存活的任务；JP/ZH/KO章节切换使用90/70边距，常规70/60；法语返回按钮按原int(width/3)舍去未显示尾列；葡语U+200B保留文本，字库覆盖检查不要求无形控制字形。中文唯一缺失音效“布こすれる（音人）”在九个XP3索引皆无；按已核验SE.tjs先停当前槽再返回，转换报告保留SOURCE_MEDIA_ABSENT，其他缺失仍失败。

当时待验的完整浏览器主线、刷新、公网加载与部署，最终结果见本报告末尾。原版逐帧对照、原生存档、第二门以后、结局鉴赏和隐藏文本框按钮未在本门验收中宣称完成。

追加：正常主线浏览器完整到达章末；原自动结束段没有稳定文本等待，测试现从实际history验证其内容/完成再计入，保持完整2478段断言；browser-whole3.log最终通过，两次刷新和章末恢复历史均通过。最新包4ab3e922857c7ae2beaaaaa0adaa0112e05f4a4c765d5efc7542c2b56e40d341来自5c965e5，Core/Protocol/WebHost文件与整章测试包逐文件SHA相同，仅修复偏好完整导入清除缺省预取覆盖。最新包公网23项（八语回放/设置、五种演出、刷新与自动Canvas后备）全部通过。

旧UI回归最初依赖单输出Canvas、序章即ended与5秒内整包启动的旧fixture假设，现按双输出单场景、door1函数边界和明确的演出开始切点校验；18项原标题/音频/控件复验及PO实际DOM/存档单项通过。正常主线没有改成测试解释器。

完整静态PB在弱网初始下载超出旧等待预算。增加构建时Brotli并校验逐字节解压，41个PB合计30937690→3592854字节；英语程序+正文3531372→397481字节。Worker真实workerd验证手动编码避免双重压缩、GET/HEAD/ETag、identity/gzip回退及鉴权，R2协议回归通过。压缩仅改变传输，不改Program/release或存档。CDP慢网2/4/8页重测进行中，先前四次未压缩冷启动失败保留在network-strategies.log。

最终弱网4策略及静态传输5项通过，比较器仍要求默认2页将按需P95与资源暂停至少减半：demand921ms/12、2页239ms/6、4页64ms/4、8页45ms/1；全部95次同源推进、180ms/750000Bps/阅读600ms，最大驻留66149960字节。较大预取只报告实际权衡，不要求单调改善。详见compressed-network-tests.log及network-comparison.log。

最终公开预览版本ba5ef07f-5f5a-4f47-a8d3-fc39c0a4e40f，回归178a1104-9b71-45bd-a749-07f30a79446c。109文件/39856419字节与本地dist匿名逐字节一致（含可选压缩副本），媒体Range及回归鉴权检查通过。没有生产带宽限额。F-01E验收完成；后续能力范围见STATUS.md。
