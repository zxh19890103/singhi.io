---
layout: post
title: "Two Months of Struggle in SPH Fluid Simulation: The Inner Journey of a Web3D Developer"
short: Unknowingly, I’ve been deeply immersed in SPH fluid simulation for over two months now. The CPU version is nearly complete, but the shader-based version
category: tech
english: 1
---

Unknowingly, I’ve been deeply immersed in SPH fluid simulation for over two months now. The CPU version is nearly complete, but the shader-based version has been far less smooth—plagued with various small issues. After introducing Grid Lookup, the system fell into chaos. I’m feeling a bit exhausted, and doubts are starting to surface: can I really continue my career in the Web3D field?

It’s honestly been a painful process.

The SPH model, conceptually, isn’t that complicated. But when it comes to implementing it in shaders, I often feel lost. The biggest challenge is that you can’t directly “see” the problems—you just know the outcome doesn’t look right. While there are plenty of detailed articles online explaining the SPH model, they often leave me more confused—maybe it’s my weak math background.

I turned to ChatGPT for help, and it has indeed been helpful. Most of the conceptual explanations and even large portions of the code came from ChatGPT. I reviewed and modified them, but they rarely worked out-of-the-box for my project. Understanding the logic and adapting it to fit the implementation is also quite painful.

In the SPH model, fluids are represented as particles—an abstraction that encapsulates the position, density, pressure, and viscosity of matter in space. After calculating these attributes for each particle, we apply motion equations and external forces to simulate fluid flow. The result is something that visually resembles water, gas, or lava. It’s fascinating, but it also requires strong mathematical and programming skills from the developer.

Neighbor search is one of the most performance-intensive tasks in SPH. It’s essential for computing the influence of nearby particles within a certain radius, which in turn affects the particle’s density and forces. On the CPU, this is so costly that the particle count has to be kept under 1200. On the GPU, however, the number can rise to 5,000, 10,000, or even more. I’ve been eager to see this effect, but once Grid Lookup is introduced, everything becomes unstable. I spent many days trying to debug it, but made no real progress.

So, I’ve decided to pause for now.

My feelings are mixed. I don’t even fully understand why I’m so obsessed with this project, but it’s definitely shaken my confidence. I’m currently unemployed and urgently seeking a job—preferably something involving Web3D. I believe I need to narrow my focus and go deeper into one field; maybe then, I’ll find my opportunity. If I keep following others’ advice to “go broad,” to “see the big picture,” I feel like I’ll end up achieving nothing at all.

And by “achieving something,” I don’t mean doing anything grand. I just want to complete one small task that brings peace to my heart. Whether others notice it or not doesn’t matter to me anymore—as long as it makes me feel fulfilled. Of course, if what I build can bring even a little value to a team, a company, or society, then I believe the market will eventually recognize it. I don’t want to follow the market blindly. Life is too short for that—it simply doesn’t work.

I still want to work in Web3D, and I plan to continue building more and more projects. I hope you can see my efforts and passion, and I’d love to bring that passion into a team. I’m also considering documenting my research and thoughts, organizing them into a book or publishing them online, to let others see the real journey of a developer.

I believe that if your heart is good, your surroundings will gradually improve, and your life will slowly become better, too.

I choose to believe in hope—not to retreat into pessimism, even in the face of a harsh job market.
