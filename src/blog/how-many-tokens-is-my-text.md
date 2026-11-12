---
title: How Many Tokens Is My Text?
description: A plain-English guide to counting tokens: what a token is, the rules of thumb for English and code, and how to get an exact count.
date: 2026-11-10
image: /assets/blog/how-many-tokens-is-my-text-hero.jpg
imageAlt: The phrase "How many tokens is my text?" split into tokens
tools: token-counter, text-cleaner, cost-forecaster
---
Every AI model reads and writes **tokens**, not words. Providers bill by the token and limit requests by the token, so knowing roughly how many tokens your text uses is the first step to controlling cost and avoiding errors.

## What a token is

A token is a chunk of text. Common short words are usually one token. Longer or rarer words are split into several pieces, and numbers, punctuation and spaces count too. The model never sees letters directly, only these chunks.

## Rules of thumb for English

- 1 token is about 4 characters of English text.
- 1 token is about three quarters of a word, so 100 tokens is roughly 75 words.
- 1,000 tokens is about 750 words, or one and a half pages of single-spaced text.

These are averages. They work well for ordinary prose and are a safe starting point for budgeting.

## When the rule of thumb is wrong

Some content uses noticeably more tokens than its length suggests:

| Content | Tokens compared with English prose |
|---|---|
| Source code | Often more, because of symbols and indentation |
| Numbers and IDs | More, because digits are split into short pieces |
| Non-English languages | Often more, sometimes two to three times as many |
| JSON and markup | More, because of brackets, quotes and keys |
| Text with odd characters or emoji | More |

If your workload is mostly one of these, measure it instead of guessing.

## Exact counts and estimates

Each model family has its own tokenizer, so the same text can have a different count in different models. OpenAI publishes its tokenizers, so counts for OpenAI models can be exact. Anthropic and Google do not offer one that runs offline, so for those models any tool can only estimate. An estimate is typically within 10 to 15 percent, which is fine for planning but not for hitting a hard limit exactly.

The [Token Counter](tool:token-counter) shows the exact count for OpenAI tokenizers and a clearly labeled estimate for everything else.

## How to count your tokens

1. Paste your text into the [Token Counter](tool:token-counter). Nothing is uploaded, it all runs in your browser.
2. Pick a tokenizer. Use the OpenAI one for OpenAI models, or the estimate for other providers.
3. Read the count and check which models' context windows it fits.

## Why it matters

- **Cost.** You pay per million tokens, with separate rates for input and output. See [what a price per million tokens means](page:glossary).
- **Limits.** A request that exceeds the model's context window fails or gets truncated.
- **Speed.** More tokens means slower responses.

## Reducing the count

Strip formatting you do not need, remove repeated boilerplate and trim long system prompts. The [AI Text Cleaner](tool:text-cleaner) removes Markdown symbols and invisible characters, and the [Prompt Token Optimizer](tool:prompt-token-optimizer) shows every cut before you accept it.

Once you know your count, the [Cost Forecaster](tool:cost-forecaster) turns it into a monthly budget.
