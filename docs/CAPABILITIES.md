# SDK 能力与当前接入边界

2026-10-31。实例通过实际tarball/public exports运行；完整第一门→间章→完整二门、回忆双选择→完整第三门与章节回放已接通，至search调查入口，见[接续验收](evidence/CONNECTED_DOORS.md)。SDK的v2 UI/流程图、视频/计时/RNG与注册operations已用原创夹具和独立实包验收；本作既定内容与原生存档认证分开。

| 能力 | 当前实现与边界 |
|---|---|
| 长音乐、音效 | versioned-url/HEAD/ETag/Range；独立SE槽与双BGM；源绑定、延迟包络和物理音量夹限；预备音频交接给独立播放源，历史/资源等待保持已有音乐。恢复按声明的replay，不承诺精确媒体seek |
| 保存、刷新 | IndexedDB原子图文存档/当前偏好/进度；手动、快速和源指定自动点；旧32/93页、完整第一门和原两门SDK档显式验证来源并迁移，旧槽保留 |
| 历史与输入 | 鼠标逐次/触控板单手势偏好；历史到底150ms返回、存读档滚轮翻页、顶层右键取消；阅读/回放右键隐藏与首次恢复、富历史/角色分组；实例采用64条只读窗口，不保存未使用的整页rollback。SDK受控回滚仍可供其他作品使用 |
| 原设置 | 独立已读字速/普通与已读可忽略确认、源滑条/按钮/复选框；当前偏好独立持久，原Default只重置原控件 |
| 解锁、回放 | 第一门末尾原flag写入持久profile；原菜单解锁前三门；同一Program函数进入临时Player/Store，关闭核验主线head/profile |
| 角色与演出 | 源部件合成、注册/排序/明暗/对齐、x/y/alpha曲线、复制相位、前后台页、交叉/规则/滚动组转场、雨/花瓣/震动/闪白；中途可存 |
| 正文 | DOM正文、源名字图、Ruby、停顿/确认/字速、续段/自动结束、字体/阴影/阶梯淡入、镜头跟随、图文层顺序和截图；ADV正文整页适配，源信件矩形及末写者可冷恢复，原窗口定义不改 |
| 加载 | demand/balanced/chapter/eager通用策略；实例默认4页，可选0/2/4/8，静态call/return扫描有界；目录与实际驻留预算分开，跨翻页接续未完成预取；驱逐清理资源事实与未消费预备设备 |
| 内存 | 空闲分批释放无引用ready资源、保护前看与租约；后台释放Canvas临时工作面并恢复重建；HTTP provider只保留校验后的目录，迁移注册表只缓存原清单；独立显示图共享原缓存/预算、释放后可回收，不改变剧情/存档签名。不是浏览器总RAM限制 |
| 图形兼容 | 一套Pixi场景，WebGL2优先、Canvas后备；正文上下图层分两次输出，额外Canvas计入预算，只有一个图像解释器 |
| i18n与传输 | PO维护、独立语言protobuf文本目录、Schema关联类型/运行时校验；浏览器HTTP传输PB，Core内部使用类型化消息，存储为IndexedDB结构化记录 |

当前设置/隐藏/富历史及有限第二门条件编译见[INTERFACE_COMPLETION](evidence/INTERFACE_COMPLETION.md)，前版滚轮/回收与IR见 [WHEEL_MEMORY](evidence/WHEEL_MEMORY.md)，此前逐帧与连续阅读见 [PERFORMANCE_READING](evidence/PERFORMANCE_READING.md)，不沿用中间版本数字。

第一门源宏全部进入有限编译器支持集；未知参数/代码/资源仍拒绝。中文版原包自身缺一条SE，按经指纹确认的原SE.tjs停槽并继续，转换报告保留缺失项。随机演出不是原Math.random的同一序列；浏览器字体栅格化不是KRKR原像素算法。

没有声称全KAG、全原生插件、全作、原生存档或所有设备已兼容。search调查章节及后续门、通关分支、结局鉴赏、模块recipe/SaveBridge/历史回溯和真实原档仍待后续验收；原始KS/TJS和资产不进入SDK或GitHub。
