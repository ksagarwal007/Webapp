---
title: How to Compare LLM API Prices Fairly
description: Price per million tokens is only the start. Learn what else to compare across LLM providers: input vs output, context size, caching, batch discounts and real workload cost.
date: 2026-11-10
tools: model-prices, cost-forecaster, token-counter
---
Comparing LLM prices sounds simple: find the cheapest number. In practice, two models with the same headline price can cost very different amounts for your workload. Here is how to compare fairly.

## Start with price per million tokens

Providers quote dollars per million tokens, with separate rates for input and output. The [Model Prices](tool:model-prices) page lists them side by side, along with the context window of each model.

## Look at input and output separately

Output is typically several times pricier than input. A model with cheap input but expensive output can be a bad deal for a chatbot that writes long answers, and a good deal for a classifier that reads a lot and answers in one word. Look at the ratio between the two prices as well as each one.

## Use your own token mix

The right comparison uses the number of input and output tokens your application actually sends. Measure a typical request with the [Token Counter](tool:token-counter), then compare models on that mix. Ticking up to four models on Model Prices shows the cost per request and per month for your numbers, and highlights the cheapest.

## Check the context window

A model that cannot fit your documents is not cheaper, it is unusable. Make sure the context window covers your input plus the reply. See [context windows explained](post:context-windows-explained).

## Include the discounts you can actually use

- **Prompt caching** lowers the price of repeated input if your prompts share a long start.
- **Batch pricing** often halves the price for work that can wait.
- **Volume or committed-use deals** may apply at larger scale.

A model that looks more expensive on the list can be cheaper once the discounts you qualify for are applied.

## Do not forget quality

The cheapest model that gives poor answers costs more in retries, fixes and unhappy users. Test two or three candidates on real examples. A small model that handles your task well beats a large one you cannot afford.

## Know where the numbers come from

Price lists change often, and aggregated catalogs can lag or contain mistakes. The prices on this site come from an open-source catalog refreshed daily, and are not verified against provider billing. Before committing to a budget, confirm on the provider's own pricing page.

## From comparison to budget

Once you have shortlisted models, the [Cost Forecaster](tool:cost-forecaster) projects the monthly cost for a chatbot, an agent or a batch job, including growing history and caching, and lets you export the result.
