# SDK高级交互模块接入

2026-10-31：消费SDK c4f553a真实tarball，摘要e538ab1e09aa1ee6fdda38c42a73d3c6ee4bdd5c1aaf26d79e20777d341643f9，与SDK隔离消费项目产物一致。包白名单270文件/606433压缩bytes，无测试/游戏/日志。

W1-03B2现有v2模块增加UI、流程图声明根、WebM、计时交互、RNG和注册operations。UI/flow签名绑定整个manifest，已返回show函数、扩展与任务保留恢复来源；注册表不符拒绝。失败/取消不接管当前会话，旧槽不回写流程图持久访问。v1支持集、单输入/模块/快照/驻留预算不变。

SDK check、377单元、29相关真实浏览器通过；严格独立tarball消费覆盖新模块UI/扩展/视频/计时/RNG/cold flow。CI发现矩阵完整覆盖235项，不称本轮全235浏览器重跑。SDK原始记录在本地artifacts，提交的证据见galbox/docs/evidence/w1-03b2/REPORT.md。

实例`pnpm sdk:update`、`pnpm check`通过，51541条PO/控制关系保持。既有冻结第一/二门PB不重编；`pnpm exec playwright test tests/integration-browser/continuation.spec.ts --config playwright.integrated.config.ts --grep "actual first-door end|native second chapter replay"`中英4项通过，覆盖真实旧第一门结束档→间章图文刷新与原生二门隔离回放。游戏内容没有据此新增；本轮不重新上传R2或重发公开预览。

跨manifest迁移、模块recipe/SaveBridge/历史回溯由W1-03B3跟进；W1-03C热记录/容量与W1-04持久缓存/离线/设备矩阵仍未完成。仍不声称整作或原生存档认证。后续仅正常追加提交与快进推送，不强推。
