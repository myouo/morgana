# 移动视口、SDK子模块与富文本PO

2026-10-28。SDK主工作区E1-04由另一会话处理，本轮仅在独立实例及其锁定依赖上开发，不修改该会话的代码或验收。

移动端：触摸设备的开始/确认读档手势内调用标准requestFullscreen；失败/不支持时继续游戏。VisualViewport宽高与偏移驱动页面，CSS扣除safe-area并保持原4:3；地址栏、旋转、键盘变化不会把画面或菜单落在可见区外。未禁止缩放或强制方向。真实Chromium触摸模拟验证原生全屏、退出后的同会话、拒绝/不支持后继续，以及受控可见视口变化/菜单边界。未宣称iOS/Android全机型实机通过。

子模块：galbox/锁定myouo/galbox提交83f157640a7327ef077afb4ace6f68102b9bcea8。pnpm sdk:build实际安装锁定依赖/构建/打包，复现SDK SHA256=7873ffcbf4c082a75c2b2655ba27cfd22800080d6c72d90247b79c2df18f7355。应用仍经vendor实包/public exports消费，子模块不是源码别名；边界检查验证160000 gitlink/远程URL，新启动的Vite不扫描或暴露子模块，实测SDK两个文件及private脚本均403；已运行的旧dev需重启加载新配置，本轮未中断它。SDK当前私有，递归克隆需访问权限。提交SDK修改后用pnpm sdk:update更新实包及lockfile，再更新父gitlink。

文本：PO现支持literal/break/confirm、原来源样式、ruby正文/读音、固定毫秒pause和speed。保护标记的数量、顺序和身份不允许译文改动；样式/时长参数来自已校验源，不由译者写入CSS/脚本。空样式/空注音、未知/缺失/重复控制明确拒绝；输入输出不共享可变别名。旧22页/8语言PO格式保持。

验证：strict/check/build、3 Python+25 TS通过；新增样式/时间/注音往返与错误反例。真实浏览器以公开SDK创建生产Program并从PO→protobuf→Player，验证DOM斜体/rt、定时停顿保存恢复、页内确认及结束。本地移动3+富文1通过；线上移动3/原网络3通过，富文线上1项也通过。pnpm preview:check匿名52文件与本地dist一致，媒体Range通过、testsdk仍401。raw在ignored artifacts/mobile-viewport、rich-po、submodule。

当前剧情没有伪增页数，仍44前导+22页。下一段的真实依赖与未验证内容见NEXT_DIALOGUE.md；预览域名已免登录，不加入下载限速。
