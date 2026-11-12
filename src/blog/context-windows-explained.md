---
title: Context Windows Explained
description: What a context window is, what counts toward it, why a bigger window costs more to use, and what happens when you go over.
date: 2026-11-10
image: /assets/blog/context-windows-explained-hero.jpg
imageAlt: A context window filling with tokens
tools: token-counter, chunker, cost-forecaster
---
A model's **context window** is the maximum number of tokens it can handle in a single request. Think of it as the size of the desk the model works on: everything it needs has to fit on the desk at once.

## What counts toward the window

The window covers everything in the request and the reply:

- The system prompt and instructions
- The conversation so far
- Any documents, search results or tool outputs you include
- Your new question
- The model's answer

Some models also count hidden reasoning tokens against the limit. Check the provider's documentation for the exact rule.

## Window size is not memory

A large window lets you send more at once, but it does not give the model a memory. Each request starts fresh. In a chat, the application re-sends earlier messages so the model can see them. If you stop sending them, the model forgets them.

## Bigger window, bigger bill

You pay for every token you send, so filling a very large window on every request is expensive. A 200,000-token request costs far more than a 2,000-token one, even if the model could handle both. A big window is a capacity, not a target.

## What happens when you go over

- The API may reject the request with an error.
- Some applications silently drop the oldest messages to make room.
- Quality can drop when a window is very full, because relevant details are harder to pick out of a huge input.

## How to check whether your text fits

1. Count the tokens in your prompt and documents with the [Token Counter](tool:token-counter).
2. Add the length you expect for the reply.
3. Compare the total with the model's context window. The Token Counter lists how many models can fit your text.

## When your text is too long

- **Split it.** Break the document into overlapping chunks with the [Text Chunker](tool:chunker) and process them separately.
- **Retrieve.** Send only the passages relevant to each question rather than the whole document.
- **Summarize.** Replace old history with a short summary.
- **Trim.** Remove boilerplate and repeated content.

## Context and cost over a long conversation

As a chat grows, the input grows with it, until it hits the window and older turns are dropped. The [Cost Forecaster](tool:cost-forecaster) models that curve, so you can see how cost rises with conversation length and where the window caps it.
