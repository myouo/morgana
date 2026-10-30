# 第三门新周目完整路线

2026-10-31，Steam 已锁定的 KS/TJS、插件和资源，只读解析，不执行 TJS、不逆向 exe。
第二门及 memory1 双分支已完成；本轮接通 scenario3 的 21 个场景及章尾，
终止于原 `search.ks:*start` 调查章节入口。八语整理后的 PO/控制身份可维护。
正式 doors12 发布清单冻结，第三门使用独立 gameId/series/DB 和生成目录。

新增有限处理为 ASD 图集、grayscale/裁剪、旧电影、残像/旋转、quakex、
无声 3000ms 心跳、信件区域和四向卷动。源插件仅在构建时转成数据；
实时任务全部交给正式 SDK Core。SDK 新增有界序列、逐帧图像资源和四向
stage.mix；没有另一套剧情 VM 或宿主私有计时器。原横排图集无缩放重排，
旧电影整帧叠层和残像逐帧图像由 SDK 准备、预取、校验、失败重试与回收。
短残像保留全部 32ms 采样，长残像保留最多 16 个候选画面。旧电影改为
128 帧/8192ms 的资源序列，摆动使用 2048ms 有界曲线。

## 实际验收

- `pnpm door3:build <locale>`：八语全部成功，21 场景/语；只用实际 tarball 与公开 exports。
- `pnpm door3:verify <locale>`：八条生产 Core 路线全部到达交接点，核对 23066 个文本片段，完成旗标/成就正确；80 个 protobuf/模块冷恢复切点通过。媒体启动报告是明确的虚拟 Host，不冒充全部声音的设备实播。最大 35 个舞台对象、51 个保留任务，未扩大限制。
- `FATA_REUSE_SERVER=1 pnpm test:door3 tests/door3-browser/text-fit.spec.ts --workers=2`：八语 22985 个实际字体完整页/信件页均无滚动和字形越界，仅 7 页缩排，最小 0.90771484375。
- 中英章头/中段/旧电影/动画/信件/长残像，真实图文 IndexedDB 保存、刷新续接：11 项通过；源滚轮单次确认后推进单独回归通过。无实验标题、说明或 SDK 工具栏。
- `FATA_REUSE_SERVER=1 pnpm test:door3 --grep='Chinese consecutive trail'`：真实浏览器连续跨 4 个效果、24 个可见换帧，峰值 66915916 bytes，低于原 67108864 bytes；真实资源/设备路径，无虚构媒体完成事件。早先大图集交接超预算的方案已由逐帧资源取代。
- `pnpm exec tsx --test tests/first-door-identity.test.ts`：八语 808 个已发布第一门函数逐字节相同；中英冻结 doors12 的章头、选择、两条路线末档共 8 个旧切点原样恢复。没有重写旧剧情/存档身份。
- `pnpm check`：类型、74560 条 PO/控制关系、独立依赖与载荷 ignore 边界通过。转换器合成资源/动画/图层回归通过；`pnpm test` 共 106 项通过。

测试构建/目录冻结后运行；原日志、PB、图集/逐帧 PNG、截图/trace、清单和包均留在 ignored 本地树。
SDK 生产提交 71ed439，实际 tarball SHA-256 为
`6e65a997d34e750c34a4629cb54d06aeac8f3d45afe9f02fe3372eee1e5acc28`；
SDK 397 单元、16 相关双后端浏览器、严格隔离实包消费和包白名单审计通过。
这不代表完整 245 浏览器矩阵、全作或原生格式认证。

## 运行与边界

已有原资料/基线的环境：`pnpm chapters:convert door3`、`pnpm door3:build all`、
`pnpm door3:verify all`、`pnpm dev:door3`，入口 `http://127.0.0.1:4185/?lang=zh`。
之后直接继续本地存档，`&cut=start` 显式从第三门章头开始。4183 二门、4184
正式主入口和公开预览保持原命名空间；本轮未发布新站点或上传 R2 素材。

随机呈现使用显式种子，不复现原 Math.random；长残像的中间画面、原生整数
混色、插件子层转场次序和定时器抖动未逐像素认证。中文 vime 不设置 time；
Phena 重复 layer 最后为 back，按原 +layer 规则落在 0，而 animstop 指向 1，
保留显式源无效操作。缺失非 base 角色部件按源返回空，不替换脸。源资源名
按 Windows 不区分大小写解析并保留尾空格；歧义拒绝。重复同名说话者留在
同一自动演出段；未知/动态未支持指令继续显式失败。

脚本输入限制、历史注记、CJK 首行定位与原动画 glyph 的既有差异仍有记录。
原生 tft、通关变体、调查章以后、原作逐帧和真实移动设备长期对照未认证。
正式第一门→二门→三门和旧 v2 模块档迁移仍需 SDK W1-03B3，不能覆盖已发布
清单后默默重标旧来源。下步先完成这一显式衔接，再推进 search.ks。
