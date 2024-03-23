---
layout: post
title: A Brief Introduction to Hai Monitoring System
short: Briefly introducing the warehouse monitoring system that I designed and developed at Hairobotics
category: tech
english: 1
---

## Design

{% include img.html src="/demo/images/monitor-design.jpg" %}

## Why Did Design This Way?

I initially read the documentation of Leaflet and experimented with its API, discovering that Leaflet extensively utilizes prototype chaining internally. I found this to be very disadvantageous for young programmers. Thus, I had a rough idea — to independently define a set of business models and then use these models to drive the initialization, updating, and destruction of Leaflet.

So, there is a mapping relationship from the business model to the Leaflet layer (view). For this, I defined the concept of a "build phase" after the application starts. The "build phase" is about establishing the association between the business model and the Leaflet layer, and making change event bindings to achieve real-time view refreshment.

Since there is a "build phase," it naturally follows to define a "destroy phase." In the "destroy phase," the association and event bindings are removed.

Each type of device has its corresponding model, and each model will establish its own Collection object. The Collection object manages the number of models and updates them to the view in real-time through events.

Much of my work focuses on model updates because here, I need to do a diff for each model. The logic of the diff needs to be combined with the characteristics of the data and the business meaning. When a change is detected after the diff, the model emits an event. Leaflet layers and React components subscribed to the model event will refresh themselves.

However, when designing the [editor](./the-editor-intro), my thoughts changed. The business model is extended based on the Leaflet layer. Therefore, I carefully read the Leaflet code for building layers and wrote several decorators to help developers better extend their business models. The reason for this change is that I found Leaflet itself is a complete event system. It's more convenient to append business properties based on it, just need to pay attention to the Leaflet API, avoid naming conflicts, and be aware that Leaflet has many hidden fields that are not using type declarations.

## How To Solve the Problem of High Frequency Message Push, such as, 50Hz

Refreshing the DOM at a frequency of 50Hz is not practical, so throttling is needed here.

However, refreshing JavaScript data at 50Hz isn't a big issue, so reducing the frequency of event emission is sufficient.

Therefore, I made some modifications to the event system of the business model in the monitoring system.

{% include code.html path="monitor-intro-changableObj.ts" %}

Here, `notificationRate` is used to implement throttling.

## How About the Multi-Zoned Warehouse?

:) on the way...

## How to Let React Component Re-render As the message comes.

Look at the code bellow:

```ts
export let globalTick = 0
export const doGlobalTick = () => {
  return ++globalTick
}

export const useGlobalTick = () => {
  const [_, dispatch] = useReducer(doGlobalTick, globalTick)
  return dispatch
}
```

This is the most critial part of code to implement the real-time rendering of React Components.

Will integer overflow occur here? Under the Js platform, the maximum safe integer can reach `9007199254740991`.

```js
console.log(Number.MAX_SAFE_INTEGER)
// 9007199254740991
```

Thus, the total render times of the whole App components can be `9,007,199,254,740,991`. Such a huge number!
