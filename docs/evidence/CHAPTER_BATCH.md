# F-01D / F-01E 本轮事实

2026-10-28。F-01D批量整理工具完成；F-01E整章剧情和回放未完成。运行范围仍44前导+32页，不声称完整序章/第一门、原档或原生像素一致。

- SDK G2-05：子模块b310d2e分支CI run40639379699全绿；270单元、DOM/IndexedDB刷新和独立打包consumer此前通过。本轮sdk:build再次复现9351c1d239d18eeb182d5d8baee0c320118ba150a8b2aac465ffe56e3fda6356。
- 八语convert：32页生产Core源trace、恢复切点、字体字形与资源SHA闭包通过。新增zero2的4秒图像与BGM并发过渡、固定/字符单位停顿、叙述/灰色窗口均来自源码；终点在首个炉火SE之前。
- chapters:convert door1/prologue/all --staging：13范围×8语274289候选，1391个≤256KiB PO。首两章20959条进入locales，后续章暂存ignored artifacts。无标签/重复标签/动态表达式/本地独有文本均保留并报出；第一门中文47条、序章中文45条没有直接英文标签对应，待人工源核对。
- check、test：strict/公开SDK边界/翻译身份与控制、3 Python+32 TS通过。真实GNU msgfmt --check全部160个已整理PO通过。合并反例验证人工修改不丢、来源改动fuzzy、移除条目obsolete、破坏控制标记拒绝。
- 第一门资源计划：190个已定位独立文件37484119字节；8057次宏/动画引用尚未展开。当前发布305文件64767707字节，全部实际R2 HTTPS摘要与Range/条件请求/认证验证。
- 浏览器：现有26项通过；新增渐进测试先因测试字段name/task和选在音乐之前的等待点失败，修正测量点后通过。原5,122,568字节OP只收到220,032媒体体字节即playing，HEAD=2、206=4，SDK明示versioned-url等级。64MiB预算保持。
- 旧线上回归曾因整轨下载和dense balanced准备超时失败；没有删断言或扩大原15秒准备门槛。修复开始动作等待音效、按需策略及正式串流后重新部署。原始失败/最终结果位于ignored artifacts/awakening、artifacts/remote。

整章门槛见../CHAPTERS.md：源角色宏/图层/天气/控制流、完整章节入口出口、解锁与隔离回放、真实保存/刷新/网络资源闭包均尚待，任务不标done。短证据入Git；trace/截图/生成JSON/日志只留本地。

最终线上：preview 0c2b325d-0617-4a7a-bfbe-ba59c2c78761；regression a572b67a-eba9-465a-8a42-1427aaeb9252。awakening-stream五项真实浏览器全部通过（3.6分钟）：中文苏醒段保存/刷新、俄语启动、32页完整走完、音效加载不阻挡开始、CDP慢网原OP渐进。匿名预览52文件4047825解码字节与本地dist一致，媒体Range通过，回归仍401；没有生产限速。

线上渐进原曲实测累计218458字节/总5122568字节即playing，2次HEAD与4次206；与本地220032字节结果分开记录。
