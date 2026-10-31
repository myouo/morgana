# 心跳原图滤镜与旧档接续

2026-10-31。HeartBeatPlugin 的 colorRect(opacity=100)、doBoxBlur(6,6) 已通过
SDK 的 stageFilteredImage 接回八语前三门。原图与配置成为来源绑定的状态，
fore/back 复制共享滤镜表面；原 500/3000ms 缩放、淡出、跳动任务和所有指令
地址/函数 ABI 不变，没有额外计时任务、实例渲染器或派生图片下载。

SDK 数值按公开 KRKR2 的 8 位染色、alpha-aware box 平均与裁剪边缘实现；
3×2 和实际半径 6 的独立 C++ 数值样本通过。不能据此宣称原作 SIMD/计时
抖动的逐像素认证。Canvas/WebGL 共用同一处理表面，候选工作分块让出、
可取消，临时 RGBA/列和也在原 64MiB 工作区预算中检查；失败保留当前画面。

实际命令与结果：

- `pnpm exec tsx tooling/freeze-heartbeat-source.ts`：按摘要保留八语旧实时三门
  原清单与代码，仅在 ignored private；此前两门/帧三门来源也保留。
- `pnpm heartbeat:build zh` 及其余七语同参数编译，随后
  `pnpm exec tsx tooling/share-procedural-assets.ts generated/heartbeat`：八语成功。
  每个旧函数逐指令核对，仅允许 stage.image → stage.image.filtered 的
  显式替换，以及既已验收的 sequence → raster 替换。由检查结果生成图片
  资源别名和必备函数；不猜测来源、不重置动画任务或剧情 PC。
- `pnpm exec tsx tooling/capture-heartbeat-cuts.ts zh`：正式旧实时三门生产 Core
  实际运行到心跳 137ms，保存原备份；未手工拼接剧情快照。
- `pnpm exec tsx tooling/verify-heartbeat-upgrades.ts zh`：最终共享版本 36 个
  两门/帧三门/实时三门旧档切点通过，22 个带滤镜；冷模块闭包、文字、栈及
  相关非媒体任务 elapsed 保持，已映射旧资源不再留在舞台。
- `node --import tsx --input-type=module -e 'import {driveIntegrated} from "./tooling/drive-integrated.ts";await driveIntegrated("zh",{root:"generated/heartbeat",third:true,artifacts:"artifacts/heartbeat"});'`：
  记忆/回避两条完整路线通过，6689/6606 个正文片段，保留解锁及第一门接续。
  媒体由显式虚拟 Host 回报；不冒充实设备播放了每段声音。
- `pnpm test:heartbeat`：实际旧档 Canvas/WebGL 各自验证文字/调用栈/137ms
  动画进度，双层共享一表面、图文保存、刷新恢复；请求只在新资源闭包内，
  无旧派生图请求。初始版本和最终共享目录均独立回归。
- `pnpm exec tsx tooling/promote-procedural.ts generated/heartbeat`：接入本地
  generated/integrated，八语清单/呈现最后替换，原文件删除数 0。

资源闭包由 publication-assets.ts 实际逐文件验摘要比较：1871→1833 条路径，
414252194→405600936 bytes；移除 38 个唯一派生资源，共 8651258 bytes，
新增资源 0。当前闭包按 SHA 去重为 370355684 bytes。这些是序章/OP/前三门
八语与兼容字体合计，不是第三门或单次实际下载量。没有图片降质/音频转码。

心跳核心的首次实包为 055ac986…；随后第四门补齐录史和通道上限也经真正
tarball 消费，最终精确 pin 见 package.json/vendor/SDK_SOURCE.toml（后者 ignored）。
原清单、源脚本、原素材、快照、日志和截图均未进入 Git。上传持续停止，
两个线上站点未切换；只更新本地主入口。
