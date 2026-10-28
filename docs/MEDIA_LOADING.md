# 长音乐渐进加载

当前实例使用正式SDK的G3-04 versioned-url端口。title/OP/序章的element音乐及循环炉火声明版本`sha256-<内容摘要>`；图片、字体、短按钮音效保持完整bytes摘要校验。调用端显式接受streaming.integrity=versioned-url；这是URL/HTTP元数据版本等级，不是客户端逐字节完整密码摘要。构建和资源发布仍计算全量SHA。

之前OP约5MiB完整下载阻挡op:001，真实线上多次超过原15秒准备门槛，旧证据保留失败。现在HEAD校验强ETag、长度、MIME和immutable/Range后由原生媒体渐进播放；保存恢复继续遵循原轨replay策略，没有新增精确音轨seek承诺。WebHost/Core/节目来源不另建实现。

本地Vite与Cloudflare Worker都拒绝错误galbox-version，支持HEAD/Range。Vite校验SHA文件名与内容并拒绝外部symlink；生产仍用私有R2不可变内容地址。开始按钮不等待短音效下载完成后才发送选择。

默认balanced提前四页、驻留资源预算64MiB；`?loading=demand`保留纯按需模式。SDK ADR0050已补无条件标签跳转预取、重叠引用交接和有界预算，音乐URL不再因租约随机化而丢失缓存；实际完整序章HTTP/公网对照见[evidence/READING_LOADING](evidence/READING_LOADING.md)。预览不做限速，只有浏览器回归用CDP模拟网络。真实OP渐进验证统计HTTP媒体体字节，必须在传完前已playing，不能凭请求尚未关闭就通过。

2026-10-30：资源等待默认不暂停已播放媒体，菜单/历史由实例声明 menuAudio=continue；用户/device/background 暂停仍生效。预备的版本音频元素由首个正式声部接手，保留缓冲且仍重验 HTTP 身份，第二声部独立；未消费设备在淘汰/销毁时释放，编码字节加 1 MiB 计入缓存估算。当前证据和网络尾延迟限制见 [PERFORMANCE_READING](evidence/PERFORMANCE_READING.md)。
