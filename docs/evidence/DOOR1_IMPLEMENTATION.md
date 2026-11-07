# 实施结果说明

本计划对应的第一门已于2026-10-29完成源码迁移与验收，当前事实以STATUS.md和evidence/FIRST_DOOR.md为准。关键纠正：KAG默认exchange=false会复制目的页；不能按只交换前后台实现。高级模块分块、原生存档与后续章仍未完成。以下保留设计与源码线索供接续。

# 第一扇门与版本迁移：本轮执行范围

2026-10-29，用户要求自动迁移旧档并彻底完成第一章；随后反馈在线序章的音乐/点击卡顿。本轮继续三个并行验证面，不把源码提取或局部能力当作整章完成。

1. 加载：原默认demand；balanced遇到源标签的无条件jump即停止。SDK ADR0050已修复同函数有界jump预取、每PC计算、新旧预取引用交接、预算前缀及稳定流URL。实例已改balanced/lookahead2/64MiB。真实完整序章慢网对照通过：b6c9d43包公网95次推进P95 916→62ms、资源暂停12→3（并非零卡顿）；最终6ec5791包同条件公网复验930→59ms、12→3，已更新公开预览，见STATUS。
2. 迁移：SDK ADR0051实现精确发行版、按需旧Program、完整旧/新Core校验的自动load迁移工厂；原槽不覆盖，当前profile只合并显式已读别名，资源准备/激活CAS沿用原路径。真实32/93页八语候选映射及活动fade共17项通过，实际旧32页IndexedDB读档/历史/原槽保留在本地和公网通过。旧93页→未来第一门入口仍待真实整章Program，不把同结构目标release测试冒充已完成。private/compat32和compat93保留真实原发布；compatibility/editions.toml固定16个旧Program摘要，pnpm compat:fetch供新开发者取得离线构建胶囊。
3. 第一门：scenario1start→zero3，15场景，英文2477个p加1段自动结束文本；全章无剧情choice/if或内嵌脚本。80种源tag（语言变体74–82）。已存在PO研究候选，每页的控制marker必须原序保留并映射到真实执行节点。

源码细节：英法等speaker由draw_name，日中韩含原名字图/历史名；char图片/相对坐标/排序/明暗与fore/back分别建模。女中_右体确为getGraphFilename返回空字符串、images清空后不画，不能伪造图片。char_motion使用LayerMotionPlugin及macros_sprites的逐轴曲线，舞蹈无限循环；雨/落叶完整TJS源码可读，不需要逆向exe。需要用严格源参数模型下沉到通用SDK能力。

第一门前置能力：SDK6ec5791/ADR0052已完成无额外点击的富文续段/自动结束/恢复用户字速、state.collect显式回收终态任务和有界历史；check、301单元、21相关浏览器、实际独立consumer通过。实例door-ir/door-text按八语PO重建完整标签顺序、同段演出边界，canskip=false保持独立真实等待；英文2478段，RU源w中未使用的字面属性只记录不伪造正文。仍缺并行逐轴关键帧/粒子、动态图层组前后台转场、具名双BGM及整章lowering。完整章须真实从入口跑到sf.scenario1，章节函数复用于临时Store回放，并验证主线head/profile不变。

精确下一项：以macros_sprites.ks/LayerMotionPlugin的16ms逐轴曲线实现可保存的stage.motion（linear/ease-in/ease-out、独立offset、无限舞蹈、前后台复制共用相位），继而有界雨/樱粒子、前后台组混合、双BGM。用15个源场景函数降低全章，控制10k指令/256任务/资源与快照预算，不能删源效果来通过。原菜单chapter.ks仅在实际sf.scenario1后解锁，用相同函数开启临时Store回放。整章尚未接生产，本轮不得标F-01E完成。

源检查raw在artifacts/door1（tags各语）；SDK修改在galbox子模块，主SDK工作区并行改动不覆盖。线上可玩正文仍为93页序章。当前完整验证/部署/Git事实见STATUS及evidence/READING_LOADING；原作行为对照、原生存档与真机仍另验。
