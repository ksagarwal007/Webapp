---
title: Microsoft Outage: What It Means for LLM Apps
description: Microsoft's November 2026 outage shows how one failure can spread. Learn how cascading failures work and how to add a fallback model to your LLM app.
date: 2026-11-13
image: /assets/blog/microsoft-outage-llm-app-fallback-hero.jpg
imageAlt: An app routing traffic to a backup provider after the main provider fails
tools: cost-forecaster, token-counter, model-prices
---
On 12 November 2026, a major Microsoft outage disrupted Outlook, Teams, Copilot and other services in many countries. If you build products on large language models (LLMs), the useful question is not who was at fault but how your own app would cope if a provider or platform it depends on failed for several hours. This guide explains how failures spread, where LLM apps are exposed, how to add a fallback, and what a fallback costs.

> **Written during an ongoing incident.** This article was written on 13 November 2026, before Microsoft published a root cause. We describe only what Microsoft and news outlets have reported, and we will update the article when Microsoft's post-incident report is out.

[[toc]]

## What has been reported about the outage

The outage began on 12 November 2026 and reached users in many regions. Microsoft said it was not aware of a cyberattack, and an executive said there was no indication of malicious activity. Microsoft's own updates, as reported by [CyberSecurityNews](https://cybersecuritynews.com/microsoft-365-massive-outage-fixes-fail-as-restored-servers-keep-going-unresponsive/), said that a number of servers became unexpectedly unavailable, that the affected servers were failing health checks, and that restored servers could become unresponsive again once traffic returned. [Al Jazeera](https://www.aljazeera.com/news/2026/11/13/microsoft-hit-by-global-outages-what-happened-and-why) reported that tools relying on Microsoft services, including ones used by OpenAI and Anthropic, were also disrupted.

What has not been reported is why the first servers failed. Microsoft has said a post-incident report with the root cause will follow. Anything beyond that is speculation, and this article does not claim to know what went wrong inside Microsoft.

## Why one failure can become many

An outage that starts small can grow through a pattern called a **cascading failure**. It works like this:
1. A few servers in a group fail.
2. Their traffic shifts to the servers that are still working.
3. Those servers now carry more load than they were built for, so some fail too.
4. The load shifts again, and the failure spreads.

Recovery can be hard for the same reason. If you bring a server back while all the waiting traffic hits it at once, it can fail again straight away. Engineers deal with this by limiting traffic, bringing capacity back gradually and rerouting. Microsoft described taking steps of this kind. We are not saying this is what caused the outage, only that it is a well-known way for failures to spread.

The lesson for your own app is the same one: a failure in one place can become a failure everywhere if nothing limits it.

## Where LLM apps are exposed

An app that calls a model API usually depends on more than the model:
- **One provider.** If your app calls a single provider and that provider is down, your feature is down.
- **Hidden platform dependencies.** A provider may rely on a cloud platform, an identity service or a routing layer you never see. A problem there can reach you even if the model itself is fine.
- **One region.** A single region is a single point of failure.
- **Retries that make things worse.** If every client retries immediately, a struggling service gets even more traffic.
- **No degraded mode.** Many apps either work fully or show an error.

## How to add a fallback

You do not need a perfect design. These steps cover most of the risk.

1. **Set timeouts.** Decide how long you will wait for a reply, so a slow provider does not hang your whole app.
2. **Retry with backoff and jitter.** Wait longer after each failed attempt and add a small random delay, so your clients do not all retry together.
3. **Use a circuit breaker.** After several failures in a row, stop calling the failing provider for a short time and switch to the fallback, then test the main provider again later.
4. **Choose a second provider or model.** Pick one from a different company, ideally on a different cloud platform, so one outage is less likely to hit both.
5. **Degrade gracefully.** When no model is available, show a cached answer, queue the request for later or switch to a simpler feature, instead of an error page.
6. **Keep prompts portable.** Different models format output differently and count tokens differently. Test your prompts and your JSON output on the fallback before you need it.
7. **Rehearse the failover.** Turn off the main provider in a test and confirm that the fallback works, with its own keys, limits and quotas.

## What a fallback costs

Most pay-as-you-go model APIs charge per token, so a standby model usually costs nothing until traffic actually reaches it. The real costs are the work of testing your prompts on it and any rate limits on a new account, which are often low until you build up usage. When a failover does happen, the price of the backup model decides your bill. Here are the newest Anthropic and OpenAI models from our price data, which updates daily.

[[api-prices Anthropic]]

[[api-prices OpenAI]]

To estimate the bill for a failover period, count your prompt with the [Token Counter](tool:token-counter), then enter the volume in the [Cost Forecaster](tool:cost-forecaster). You can compare more providers on [Model Prices](tool:model-prices).

## A short checklist

- Do you know which providers and platforms your app depends on?
- Does every model call have a timeout?
- Do your retries use backoff and jitter?
- Is there a second provider with working keys and quotas?
- Have you tested your prompts and output format on the fallback?
- What does your app show when every model is unavailable?

## Frequently asked questions

### What caused the November 2026 Microsoft outage?

Microsoft has not published a root cause yet. It has said there is no indication of a cyberattack and that a number of servers became unexpectedly unavailable. A post-incident report is expected to give the full cause, and we will update this article when it is out.

### What is a cascading failure?

It is a failure that spreads. When some servers fail, the ones left carry more load and can fail too, so a small problem grows into a large one.

### Do I need two providers for my LLM app?

Not always. It depends on what an outage would cost you. If your feature is important, a second provider is the most direct protection. If it is not, timeouts, sensible retries and a clear error message may be enough.

### Will a fallback model double my costs?

Usually not. Pay-as-you-go APIs charge for what you use, so the backup model only costs money when requests are sent to it. Testing and setup take time, though, and you should check the backup's rate limits.

## Sources

- [CyberSecurityNews: Microsoft 365 massive outage, fixes fail as restored servers keep going unresponsive](https://cybersecuritynews.com/microsoft-365-massive-outage-fixes-fail-as-restored-servers-keep-going-unresponsive/)
- [Al Jazeera: Microsoft hit by global outages, what happened and why](https://www.aljazeera.com/news/2026/11/13/microsoft-hit-by-global-outages-what-happened-and-why)
- [Forbes: Microsoft outage, what happened and what to do next](https://www.forbes.com/sites/kateoflahertyuk/2026/11/13/microsoft-outage-what-happened-and-what-to-do-next/)
