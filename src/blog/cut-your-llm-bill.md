---
title: Seven Ways to Cut Your LLM Bill
description: Practical ways to reduce LLM API spend: shorter prompts, caching, cheaper models, history limits and batch pricing, with how to judge each trade-off.
date: 2026-11-10
tools: prompt-token-optimizer, cost-forecaster, model-prices
---
Most LLM bills are driven by a few things: how many tokens you send, how many the model writes, and which model you use. These seven changes tackle each, in roughly the order worth trying.

## 1. Trim your prompts

Prompts collect filler: repeated instructions, polite padding, examples nobody needs. Because the same prompt is sent on every request, a few hundred wasted tokens multiplies fast. The [Prompt Token Optimizer](tool:prompt-token-optimizer) finds filler and repeats and shows every change, so you accept only what is safe.

## 2. Use prompt caching

If a long chunk of your prompt is identical across requests (system prompt, reference documents, tool definitions), many providers bill repeated reads at a steep discount. It helps most when requests come close together, because caches expire.

## 3. Pick the right model for the job

The largest model is rarely needed for every task. Classification, extraction and simple rewriting often work well on a small, cheap model. Reserve the expensive one for hard reasoning. Compare options on [Model Prices](tool:model-prices) and test your own examples before switching.

## 4. Cap the output

Output tokens usually cost several times more than input tokens. Ask for concise answers, set a maximum length and request structured output instead of prose when you only need fields.

## 5. Limit conversation history

In a chat, every turn re-sends everything before it. Keep the last few turns, summarize older ones, and drop tool results you no longer need. This keeps long conversations from growing the input without limit.

## 6. Send less context with retrieval

Instead of pasting a whole document into every request, split it into chunks and send only the few most relevant ones. The [Text Chunker](tool:chunker) helps you choose chunk sizes and test which chunk answers a question.

## 7. Use batch pricing for work that can wait

Several providers discount asynchronous batch jobs by around half in exchange for slower turnaround. Evaluations, bulk classification and overnight document processing fit well.

## Measure before and after

A change is only a saving if you can see it. Enter your workload into the [Cost Forecaster](tool:cost-forecaster) before and after the change, and compare the monthly totals. The forecaster also shows which inputs the bill is most sensitive to, so you know where to look first.

> Quality matters more than the last percent of savings. Test any cheaper model or shorter prompt on real examples before rolling it out.
