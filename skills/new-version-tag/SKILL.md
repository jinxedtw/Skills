---
name: new-version-tag
description: >-
  Draft Google Play release “What’s new” / update changelog text in the exact
  multi-locale tagged format Play Console expects. Requires a version range
  such as 1.1.0-1.2.0. Use when the user says 更新日志, 帮我写更新日志,
  GP 更新日志, Play what’s new, release notes, or /new-version-tag.
---

# Google Play 更新日志

根据版本改动，写出 Google Play「该版本的新内容 / What’s new」文案。

## 规则

1. **必须先拿到版本区间**：格式为 `旧版本-新版本`，例如 `1.1.0-1.2.0`。用户未给出时先问清，不要开始写日志。
2. 弄清该版本区间内的改动（用户说明、git log、版本号均可）。信息不够再问，不要空写。
3. **必须保留每种语言的开闭尖括号标签**，例如 `<en-US>` 与 `</en-US>`。只把更新日志正文填进对应语言的尖括号中间；禁止省略、转义、改写或删除任何一对尖括号标签。
4. 整段结果放进 **一个** 纯文本代码块（\`\`\`text ... \`\`\`）里输出，避免聊天界面把尖括号当 HTML 吃掉；代码块外不要再写标题或说明。用户复制时复制代码块内全部内容（含尖括号标签）粘贴到 Play Console。
5. **标签名与顺序必须与模板完全一致**，Google 才能识别。不要改成别的 locale、不要缺语言、不要调换顺序。
6. 每种语言 2–5 条要点，每条一行，以 `• `（项目符号 + 空格）开头。
7. 文案按各语言自然表达，不要整段机翻硬套；专有名词（如 Google Play、RAM、Wi‑Fi）可保留常见写法。
8. 不要写内部实现细节（类名、PR、厂商 ROM bug 排查过程）；面向普通用户。

## 输出模板（格式禁止改动）

下方 14 种语言的尖括号标签必须原样出现在最终输出里；将标签内部的占位提示替换为符合上述规则的更新日志正文。

```text
<en-US>
请在此处输入或粘贴 en-US 语言的版本说明
</en-US>
<de-DE>
请在此处输入或粘贴 de-DE 语言的版本说明
</de-DE>
<es-ES>
请在此处输入或粘贴 es-ES 语言的版本说明
</es-ES>
<fr-FR>
请在此处输入或粘贴 fr-FR 语言的版本说明
</fr-FR>
<hi-IN>
请在此处输入或粘贴 hi-IN 语言的版本说明
</hi-IN>
<id>
请在此处输入或粘贴 id 语言的版本说明
</id>
<it-IT>
请在此处输入或粘贴 it-IT 语言的版本说明
</it-IT>
<ja-JP>
请在此处输入或粘贴 ja-JP 语言的版本说明
</ja-JP>
<ko-KR>
请在此处输入或粘贴 ko-KR 语言的版本说明
</ko-KR>
<pt-BR>
请在此处输入或粘贴 pt-BR 语言的版本说明
</pt-BR>
<ru-RU>
请在此处输入或粘贴 ru-RU 语言的版本说明
</ru-RU>
<th>
请在此处输入或粘贴 th 语言的版本说明
</th>
<vi>
请在此处输入或粘贴 vi 语言的版本说明
</vi>
<zh-CN>
请在此处输入或粘贴 zh-CN 语言的版本说明
</zh-CN>
```

语言与标签顺序固定为：`en-US` → `de-DE` → `es-ES` → `fr-FR` → `hi-IN` → `id` → `it-IT` → `ja-JP` → `ko-KR` → `pt-BR` → `ru-RU` → `th` → `vi` → `zh-CN`。
