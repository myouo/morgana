# 启动元数据装载优化（2026-11-05）

原标题出现前需要历史提示、章节标题和书签名共16个独立protobuf片段。旧实现
逐个请求；当前改为最多4个并发，全部校验成功后按原清单顺序合并。路径、SHA、
各片段/条目容量和重复身份检查均保留，失败停止排队；应用失败时取消同批
在途请求。游戏界面和剧情Program/存档身份没有改动。

八语实际title数据与旧实现逐项深比较完全相同，包括约4.28万历史提示、
274/278组章节标题和约3.58万书签身份；没有为了加速删掉后段或旧来源。
受控的每请求80ms异步延迟样本（Node测试回调，不是Worker/R2限速）三组：
串行1648/1654/1653ms，四并发604/596/605ms。这个数字仅代表该元数据阶段。

本机Chrome无节流trace观测16片段并发峰值4、请求跨度1787ms；CLS为0。
Canvas标题在trace内未提供可用LCP/INP，不将FCP或本地结果当作公网首次可玩
承诺。ForcedReflow仅4ms且无估算收益，没有为此增加其他改动。

中英实际标题/设置往返、损坏历史片段拒绝启动及原Retry恢复共3浏览器通过。
首次测试发现Vite遍历历史generated素材导致ENOSPC；已将generated/public排除
文件监听，不改静态资源访问。最终同组重跑40.1秒，0失败/0跳过，无ENOSPC。

实际命令：

- `pnpm exec tsx --test tests/history-parts.test.ts`：5项通过，覆盖乱序合并、四并发上限、坏摘要停止排队、重复身份和非法路径。
- `pnpm exec tsx artifacts/startup-optimization/compare.ts`：八语相等及受控样本通过。
- `pnpm exec playwright test --config playwright.startup.config.ts`：最终3项通过。
- `pnpm check`：通过（SDK接入前）；后续新SDK接入再验受影响项。

临时比较器、JSON、日志、截图和trace保留ignored artifacts/startup-optimization。
当前先完成本地优化；线上仍为STATUS所列历史注释版本，不能冒称已经部署。
