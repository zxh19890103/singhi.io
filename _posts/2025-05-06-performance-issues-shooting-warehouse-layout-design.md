---
layout: post
title: How I Achieved Smooth Rendering in My 3D Warehouse System
short: How I Achieved Smooth Rendering in My 3D Warehouse System
category: tech
english: 1
---

<div style="text-align: center;">
<iframe width="424" height="238" src="https://www.youtube.com/embed/VVTQTGhVmd4" title="Warehouse Visualization With Wik (Based On ThreeJs)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

A few strangers recently reached out to me after watching the 3D warehouse system demo I posted on YouTube. They asked whether I could share the source code or at least explain how I made the system run so smoothly.

I’ve been traveling recently and haven’t had the time or focus to sit down and write about it. But this question has been on my mind for a while. So I decided to write something—at least a short article—to share my approach. Partly to help those curious friends, and partly to help myself revisit the original design from a higher-level perspective.

I hope this article helps you—and helps me too.

---

## Drawing the Shapes: Conveyor Belts, Packages, and Boxes

You may not believe it, but all the shapes in the scene were **not imported as models**—I generated them entirely in code.

Every object is built using `THREE.BufferGeometry`, by calculating the vertices manually: containers, packages, racks, and even the complex conveyor belts.

### Conveyor Belts: Built from JSON and Geometry

In the real world, conveyor systems are made up of different segments: straight lines, curves, inclines, and more. I abstracted each segment as a JSON definition and wrote logic to generate the appropriate vertices based on that input.

Yes, it's a bit tedious—and not necessarily the perfect solution—but it gives me full control. For instance, I can mount devices onto individual segments if needed.

You can explore the key files here:

- `ConveyorReal.class.ts`
- `Item.class.ts`
- `Rack.class.ts`
- `Container.class.ts`

---

## Efficient Rendering of Massive Numbers of Similar Objects

Since racks, containers, and packages all share the same shape (only differing in size, color, or position), I used **`THREE.InstancedMesh`** to improve rendering performance.

I also wrapped it into a custom class called `wik.InstancedMesh`, adding enhanced interactivity, search, addition, and removal capabilities.

### Why InstancedMesh Boosts Performance

- **Reduced Draw Calls**
  Normally, rendering 1000 objects takes 1000 draw calls. InstancedMesh requires only one, drastically reducing CPU-GPU overhead.

- **Shared Geometry and Material**
  All instances share the same model and material, saving memory and avoiding state switching.

- **GPU Batch Processing**
  The GPU handles all position, rotation, and scale data in parallel, making it much faster.

📌 **Summary:**
“Less communication, more batch processing”—let the GPU do the heavy lifting.

---

### What `wik.InstancedMesh` Adds

My custom wrapper around InstancedMesh provides:

- Support for **adding/removing** instances dynamically
- Optimized updates using `updateRange` to reduce data upload size
- Ability to convert a specific instance into an individual object for animation via `toIndividual`, and revert back via `toInstanced`

---

## Interaction and State Management

Every object in the warehouse system needs to be selectable, with hover effects for visual feedback. To support that, I designed a general mouse interaction protocol.

### How It Works

If you want your object to respond to mouse events, simply implement the required interface from `Interactive.ts`. Once implemented, the object will:

- React to hover events (e.g., highlight)
- Handle selection clicks
- Maintain interaction state

This works for both `Object3D` and `InstancedMesh` objects and greatly improves system extensibility.

---

## Animation Framework

The animation system is based on registering and removing **frame functions** dynamically.

You can register an animation function at any time, and remove it once the animation ends. You are in full control of the animation logic.

Here’s an example:

```ts
const ffn = (delta, elapsed) => {
  // Your custom animation logic
  if (/* animation ends */) this.unframe(ffn);
};

this.onframe(ffn);  // Register the animation function
```

This system is lightweight, flexible, and easy to manage for both temporary and continuous animations.

---

## Summary

When rendering a large number of similar objects, performance is critical. Here's how I addressed it:

- Use `InstancedMesh` to minimize draw calls
- Use `updateRange` to reduce data upload frequency and volume
- Encapsulate interaction and rendering logic for modularity
- Abstract conveyor segments with JSON to allow for flexible, dynamic structures

This approach may not be perfect, but it solved the problems I was facing at the time—and helped the system run smoothly.

---

If you're interested in a particular part of the implementation or want a deeper dive into specific areas, feel free to leave a comment or reach out. I’ll try to share more technical details when I have the time.

Thanks for reading!
