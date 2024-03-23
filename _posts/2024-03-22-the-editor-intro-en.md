---
layout: post
title: Introduction to The Graphic Editor Based on Leaflet
short: I would like to briefly introduce the editor project designed and developed at Hairobotics.
category: tech
english: 1
---

## What kind of editor is it?

Unlike popular graphic editors on the market, such as the flowchart editor in Feishu Docs or web design software like Figma, this editor is designed specifically for warehouse layout needs. The term "warehouse layout" refers to representing the equipment found in actual warehouses, such as shelves, locations, charging stations, conveyor belts, etc., graphically on a canvas. The editor provides users with the ability to configure both physical and operational aspects.

Physical configuration involves visible data such as the size, position, angle, and appearance of equipment. Operational configuration includes relationships necessary to describe the equipment and the underlying logic of warehouse software.

The original design of this editor was inspired by CAD drawings, offering capabilities for individual and batch configuration.

## What is this editor, and what are its core functionalities and why is it needed?

Originally, editing based on `JSON` files was prone to errors and non-professionals couldn't participate in this work. The company had also developed one or two single-function, technically demanding configuration software before. Therefore, there was a need for software that encompasses the entire warehouse map creation process, to standardize workflows and ensure the accuracy of configurations.

Core functionalities:

- Import: Initialization from CAD drawings.
- Editing: Physical and operational configuration of equipment.
- Export: Map file.
- Multi-user collaboration.
- Server-side undo/redo.
- Conveyor line editing.

## Design

### The Structure

{% include img.html src="/demo/images/editor-design.jpg" %}

The following are the three core interfaces:

### Objects Management - Collection

Object Management –– Collection: Its role is to manage graphical or non-graphical elements. Any addition, deletion, or modification of elements must be performed through the collection.

```ts
interface Collection<M = any> extends Iterable<M> {
  /**
   * Add an object to the dataset, mark it as "Added", and it will be remotely added upon the next submission.
   */
  add(item: M): void
  addRange(...items: M[]): void
  /**
   * Add an object to the dataset. If it's local data, mark it as "Added"; otherwise, it remains "Unchanged".
   */
  attach(item: M): void
  attachRange(...items: M[]): void
  /**
   * Remove an object from the dataset, mark it as "Deleted", and it will be remotely removed upon the next submission.
   */
  remove(item: M): void
  removeRange(...items: M[]): void
  /**
   * Mark the object as "Modified", and it will be updated in the corresponding remote object upon the next submission.
   */
  update(item: M): void
  updateRange(...items: M[]): void
  has(key: string | M): boolean
  find(key: string): M
  query(predicate: (item: M) => boolean): M[]
  /**
   * Create a default object and add it to the dataset.
   */
  create(...args: any[]): M
}
```

### Persistent Object

Objects that implement this interface have the capability to synchronize data with the server.

```ts
interface PersistableObject {
  /**
   * The current associated data context
   */
  $context: PersistableContext
  /**
   * The currently associated batch object
   */
  $batch: Batch
  /**
   * The currently associated collection
   */
  $set: PersistableCollection

  persistableObjectType: PersistableObjectType
  persistingId: string
  persistingState: PersistableState

  /**
   * Is data currently synchronizing?
   */
  commiting: boolean
  isUpdateRequestFromOtherClient: boolean
  isInFromJSONValueFrame: boolean

  /**
   * Submit the current object, expecting it to synchronize with the remote system, and wait for a remote response.
   */
  commit(): void
  /**
   * The response received from the remote.
   */
  receiveCommit(error?: any, payload?: CommitAnswer): void
  /**
   * Is it only local data?
   */
  isLocal(): boolean

  /**
   * Since you already know that this item needs to be deleted, execute a "remove" operation to synchronize this action.
   * It's named "removeSelf" because Leaflet Layer already has a method called "remove".
   */
  removeSelf(): void
  /**
   * You already know that local data has been modified, so execute an "update" operation to upload these modifications.
   */
  updateSelf(): void

  /**
   * Generate a snapshot.
   */
  snapshot(): void
}
```

### Persistent Object Collection

Used for managing persistent objects, the basic logic inherits from "collection," but also supplements synchronization data logic.

```ts
export interface IPersistableCollection<
  T extends PersistableObjectExports = PersistableObjectExports,
> {
  isUpdateRequestFromOtherClient: boolean
  $context: PersistableContext
  findFromTrash(key: string): T
  find(id: string): T
  update(item: T): void
  requestToRemove(item: T): void
  requestToCreate(args: any): void
  requestToModify(item: T, args: any): void
  createFromJSON(arg: any): T
  createDefault(...args: any[]): T
  has(item: T): boolean
  add(item: T): void
  iter(fn: (m: T) => void): void
  getIdentity(): string
  updateIndexById(received: any): void
}
```

### Object Status

The status of persistent objects determines different behaviors when storing is submitted.

```ts
enum PersistableState {
  Added = 10,
  Deleted = 20,
  Detached = 30,
  Modified = 40,
  Unchanged = 50,
}
```

## Technology stack

- [Leaflet](https://leafletjs.com/reference.html), As the underlying layer for graphic rendering
- [glMatrix](https://glMatrix.net/docs/)，An extension used for graphic transformation functionality on Leaflet.
- [React](https://react.dev/reference/react)，DOM Rendering
- [Antd](https://ant.design/components/overview/)，Component Lib.

Leaflet is originally a library used for building map applications, and using it for a warehouse editor might not seem appropriate. However, there are historical reasons for our choice.

When developing the monitoring system, we tried using [X6](https://x6.antv.antgroup.com/) and considered [FabricJs](https://fabricjs.com/). X6, which uses SVG rendering, is not suitable for rendering large-scale graphical elements. We experimented with it and found that it struggled with rendering just over 3000 points (the simplest graphics). FabricJs, which has been adopted in several historical projects at HaiRou, was also reported by colleagues to have very limited rendering capabilities for large batches of elements.

Leaflet's rendering includes various methods:

- Tile rendering for maps, which is essentially images
- SVG rendering
- Canvas rendering
- DOM rendering, such as HTML or images

I tested using Canvas to draw 10,000 points, and it performed well. Leaflet's internal optimization, which ignores rendering parts beyond the view, contributes to this. Additionally, Leaflet was strongly recommended by the department manager at the time, who mentioned its layering feature to address some rendering performance issues.

However, in hindsight, choosing Leaflet was not the best decision for several reasons:

- It is quite outdated, with a very unfriendly API.
- Many basic functions need to be implemented manually, such as graphical transformations.
- Poor modularity made extending it very challenging.
- Due to the lack of ES6 at the time, Leaflet's extensive use of prototype chain techniques made the code hard to understand.
- Many functionalities couldn't be achieved, or implementing them would be too costly.

Despite these drawbacks, I spent over a year using Leaflet and gained a comprehensive understanding of its API and internal logic. Its viewport interaction capabilities were excellent. Given this background, when starting the editor project, we believed it was relatively safe to continue using Leaflet for graphic rendering. Learning a new graphics library would be time-consuming, and we were concerned about completing the work within the limited time available.

Later, we considered libraries like [Pixi](https://pixijs.com/), which is a 2D graphics library developed on WebGL. Its rendering performance and API are indeed much better than Leaflet's. However, it lacks layering logic (which I implemented myself in the graphics library project, meaning different types of elements can render on their respective canvases), and viewport functionalities require users to integrate third-party plugins.

GlMatrix is a library I used during my personal study of 3D rendering in the early years. It provides comprehensive functions for transformations or 3D vector calculations, which I am familiar with. In the editor project, I extended Leaflet's graphic transformation functionality using it, referencing the implementation in Three.js.

{% include code.html path="editor-intro-transform.ts" %}

React is used for DOM rendering, as required by the company's tech stack.

We chose Ant Design (antd) for the component library. It offers comprehensive components, has a good reputation, and a strong ecosystem, making it the preferred choice among domestic component libraries. We believe it will save us a lot of time.

This summarizes our technology selection process. Most decisions were based on historical reasons and personal proficiency. I have great confidence in using these technologies to meet the requirements.

## Several Challenges Encountered during Implementation and How I Resolved Them

- Extending Leaflet to Support Basic Graphic Transformation Capabilities
- Achieving Real-time Storage and Rendering of Maps
- Implementing Undo/Redo Considering Real-time Storage and Rendering of Maps
- Rendering Large Batches of Graphic Elements, such as 100,000 Points
- Enabling Simultaneous Operations by Multiple Users

### Extending Leaflet to Support Basic Graphic Transformation Capabilities

I utilized glMatrix and referenced the implementation in [Three.js](https://github.com/mrdoob/three.js/blob/dev/src/core/Object3D.js#L578) to create a Mixin. This Mixin integrates with Leaflet's layers, allowing the graphic elements in Leaflet to possess transformation capabilities.

### Achieving Real-time Storage and Rendering of Maps

This was a relatively complex task. The need for real-time rendering stemmed from the initial design of the project. Initially, with a limited number of developers, a significant portion of the generation and validation computations were delegated to backend colleagues. After backend computations, the results were pushed to the frontend via WebSocket. The frontend adjusted local states to synchronize with server states and responded correctly in the interface. Therefore, the editor not only focused on UI changes but also on backend (or WebSocket) requests for changes. UI interactions led to changes in local states, which were continuously pushed to the backend. The backend stored these states, provided feedback to the frontend, and modified element states to 'Unchanged'.

### Implementing Undo/Redo Considering Real-time Storage and Rendering of Maps

This was even more challenging due to the real-time storage and rendering of maps. As data was continuously stored, undo/redo operations couldn't be solely managed on the frontend. Instead, the frontend maintained an operation stack. When a user initiated an undo/redo action, a request was sent to the backend to perform the operation. The backend then pushed the changes to the frontend, which promptly responded. This process was elaborated upon in the previous section.

### Rendering Large Batches of Graphic Elements, such as 100,000 Points

To address the efficient rendering of large batches of graphic elements, such as 100,000 points, I customized Leaflet's graphic event implementation. This customization allowed users to interact across canvases. Different types of elements were drawn onto different canvases, ensuring that rendering 100,000 points posed no performance issues.

## What Did I Gain from This Experience?

- Defined a set of mixin implementation standards.
- Gained a clear understanding of the internal graphic transformation logic in Three.js.
- Expanded my knowledge of SVG, including concepts like viewport and animations.
- Deepened my understanding of mapping libraries like Leaflet and gained insight into the GeoJSON standard.
- Learned how to develop large-scale applications, emphasizing separation of concerns and robust data flow pipelines.

### Defined a Set of Mixin Implementation Standards, See Code

{% include code.html path="mixin-routine.ts" %}

### Gained a Clear Understanding of Three.js' Internal Graphic Transformation Logic

Element transformations—position, orientation, and size—did not affect the values of these three properties for child elements. Instead, Three.js maintained a transformation matrix for each element, which influenced these changes. This matrix was then sent to WebGL, which determined how child elements should be displayed in terms of position, orientation, and size.

### Expanded Knowledge of SVG

This included understanding concepts like viewport and animations. Additionally, I learned that external CSS can directly access SVG nodes, allowing for the application of styles and animations.

### Deepened Understanding of Leaflet and Mapping Libraries

This included gaining insight into how maps are rendered and understanding the GeoJSON standard to some extent.

### Learned How to Develop Large-scale Applications

This involved emphasizing separation of concerns and designing robust data flow pipelines. In the editor project, components such as Canvas Rendering, DOM Rendering, Domain, and Data were strictly separated, and careful consideration was given to the design of communication mechanisms.

Developing large-scale applications requires high-level design, abstraction of core concepts, clear definition of interfaces, and determination of how layers, modules, and components communicate with each other. Establishing key data flow pipelines is essential for maintaining code quality and facilitating control by developers in later stages.
