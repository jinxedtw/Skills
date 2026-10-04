---
name: reply-user-review
description: >-
  Draft a Google Play / app-store reply to a user review in the same language as
  the original review (max 350 characters) and supply a Simplified Chinese
  translation (中文对照). Requires the user's original review text. Use when the
  user says 回复用户的评价, 回复评价, 用户评价, reply to review, or /reply-user-review.
disable-model-invocation: true
---

# 回复用户评价

回复用户的评价，
需要用户的原评价
1.回复时提供对应语言的评价，不能超过350个字，以及中文对照

## 缺原文先问

没有用户的原评价时，先向用户要原文（可附商店语言/星级），不要先写回复。

## 执行

- 「对应语言」= 原评价所用语言（含口语/缩写也用该语言回复）。
- 「不能超过350个字」按商店回复上限执行：目标语言正文 **不超过 350 个字符**（含空格与换行）。写完后自行计数；超限必须删减后再给出。
- 先给出可直接粘贴的商店回复，再给出中文对照。不要把中文对照算进 350 限制。
- 语气礼貌、简短；不承诺未实现功能；不清楚的点用提问收口，方便用户继续说明。
