---
layout: post
title: "Domain-Driven Design (DDD): A Guide to Building Scalable, High-Performance Systems"
short: "Domain-driven design (DDD) is a software design approach that focuses on modeling the software to match the domain, or the subject area, that the software is intended for. DDD helps developers create software that is aligned with the business needs and terminology of the domain experts, users, and stakeholders."
english: 1
category: tech
src: https://romanglushach.medium.com/domain-driven-design-ddd-a-guide-to-building-scalable-high-performance-systems-5314a7fe053c
---

Domain-driven design (DDD) is a software design approach that focuses on modeling the software to match the domain, or the subject area, that the software is intended for. DDD helps developers create software that is aligned with the business needs and terminology of the domain experts, users, and stakeholders.

## History

It originated in the 1980s and 1990s, with Richard P. Gabriel being an early pioneer who introduced “domain models” as mental models of the business guiding software development.

Eric Evans further developed DDD in the late 1990s and early 2000s. His book “Domain-Driven Design: Tackling Complexity in the Heart of Software” defined DDD as creating software based on a deep understanding of the business domain and outlined principles for creating domain models, including using object-relational mapping (ORM) tools.

Today, DDD is widely accepted and applied across various domains like financial services, healthcare, and e-commerce.

## Benefits

**Communication**: improves communication between developers, managers, and domain experts by providing a shared language and understanding of the business domain

**Productivity**: increases productivity by providing a clear understanding of the business domain and by encapsulating the domain logic in a way that is easy to understand and maintain

**Improved Maintainability**: improves maintainability by providing a modular, object-oriented design that is easy to understand and modify

**Scalability**: improves scalability by providing a way to break down a large monolithic application into smaller, more manageable pieces

**Flexibility**: improves flexibility by providing a way to handle complex business processes and to adapt to changing business requirements

## Challenges

**Learning Curve**: can be challenging to learn, especially for developers who are new to object-oriented programming or domain modeling

**Complexity**: can be complex, especially for large, complex domains. It requires a significant amount of time and effort to create a well-designed domain model and to implement the domain logic

**Resistance to Change**: can be challenging to implement in organizations that are resistant to change or that have a strong culture of siloed development

**Lack of Resources**: requires a significant amount of resources, including time, money, and personnel

## Arhitecture

{% include img.html src="https://miro.medium.com/v2/resize:fit:2000/format:webp/1*QvPKg325bdpZn0sO9DCN3g.jpeg" title="Domain-Driven Design: Hight Overview Architecture" %}

### User Interface

The user interface layer is responsible for presenting the system to the users and handling their interactions. It can be a web page, a mobile app, a desktop application, or any other form of user interface. The user interface layer should be thin and simple, delegating most of the logic and functionality to the application layer.

The user interface layer should also be decoupled from the domain layer, meaning that it should not depend on the domain objects or concepts directly. Instead, it should use data transfer objects (DTOs) or view models that are tailored to the specific needs of the user interface. This way, the user interface layer can be changed or replaced without affecting the domain layer.

### Application Layer

The application layer is responsible for coordinating the actions and workflows of the system. It acts as a mediator between the user interface layer and the domain layer, orchestrating the use cases and scenarios that the system supports. The application layer should be thin and stateless, containing only the logic that is specific to the application and not to the domain.

The application layer should also be decoupled from the infrastructure layer, meaning that it should not depend on any external resources or services directly. Instead, it should use interfaces or abstractions that are defined by the domain layer, such as repositories or services. This way, the application layer can be tested or deployed independently from the infrastructure layer.

### Domain Layer

The domain layer is responsible for implementing the core business logic and rules of the system. It contains the domain model, which is a representation of the concepts and behaviors that are relevant to the problem domain. The domain model consists of entities, value objects, aggregates, services, events, and other elements that capture the essence and meaning of the domain.

The domain layer should be rich and expressive, containing most of the logic and functionality of the system. The domain layer should also be isolated and self-contained, meaning that it should not depend on any other layers or external resources directly. Instead, it should define its own interfaces or abstractions that are implemented by other layers, such as repositories or services. This way, the domain layer can be evolved or refined without affecting other layers.

### Infrastructure Layer

The infrastructure layer is responsible for providing technical services and resources to support the other layers. It can include databases, message brokers, web servers, cloud platforms, 3rd-party APIs, or any other external components that are required by the system. The infrastructure layer should be generic and adaptable, implementing the interfaces or abstractions that are defined by the domain layer.

The infrastructure layer should also be configurable and interchangeable, meaning that it should allow for different implementations or providers to be used depending on the environment or situation. For example, it should be possible to use a different database or message broker for testing or production purposes. This way, the infrastructure layer can be optimized or replaced without affecting other layers.

## Principles

DDD is based on 3 main principles:

**Focus on the core domain and domain logic.** The core domain is the subset of the business domain that is most relevant and essential for the software. The domain logic is the set of rules and behaviors that define how the domain works and what it can do. By focusing on the core domain and domain logic, developers can deliver more value and quality to the users and stakeholders.

**Base complex designs on models of the domain.** A model is a simplified and abstract representation of the domain that captures its essential aspects and ignores irrelevant details. A model helps developers to understand, communicate, and reason about the domain. A model also guides the design and implementation of the software, ensuring that it conforms to the domain logic and terminology.

**Collaborate with domain experts and stakeholders to improve the application model and resolve any emerging domain-related issues.** Domain experts are people who have deep knowledge and experience in the business domain, such as business analysts, managers, or end-users. Developers should work closely with domain experts to elicit their requirements, validate their assumptions, and get their feedback.Domain experts can also help developers to refine and evolve the model, as well as to identify and resolve any gaps or inconsistencies between the model and the reality of the domain.

### Domain-Driven Design is a Programming Paradigm

DDD is a programming paradigm that focuses on the domain model, which represents the business domain in code. It’s not just a collection of data structures, but a living representation of the business domain, encapsulating its behavior and logic.

### Structured Approach to Modeling the Domain

DDD uses a structured approach to model the domain based on a clear understanding of the business domain. It employs a ubiquitous language, a shared language used by all stakeholders to describe the business domain.

### Objects for Represent Domain Entities and Value Objects

Domain entities have a unique identity and are the primary focus of the domain model. Value objects, while not having a unique identity, are still important to the domain.

### Aggregates for Defining the Boundaries of a Unit of Work

They are clusters of objects treated as a single unit of work, ensuring data consistency across the system.

### Domain Events for Communicating Significant Changes or Occurrences

Domain events, which are unique to the domain, inform other system components about crucial changes, thereby ensuring data consistency. Essentially, when a notable change occurs, a domain event is generated and disseminated, prompting other system components to respond and update their data accordingly.

### Domain Services for Encapsulating Domain Logic and Provide a Way to Interact with the Domain Model

Domain services provide a structured and controlled interface for interacting with the domain model. These services are not tied to a specific entity or value object, offering a modular and maintainable approach to defining the behavior of the domain. This ensures the integrity of the domain model while facilitating developer interaction.

## Key Concepts

### Domain Model

A domain model is a representation of the domain concepts, rules, and behaviors in code. It is the heart of a DDD application, as it captures the essence of the problem domain and provides a common language for developers and domain experts and stakeholders.

- **Focused**: include onlythe relevant aspects of the domain, and avoid unnecessary complexity or technical details
- **Explicit**: make the domain concepts and rules clear and explicit, using well-defined terms and structures
- **Isolated**: decoupled from other layers or concerns of the application, such as the user interface, the database, or the network.
- **Testable**: easy to verify and validate its correctness and behavior using automated tests

### Ubiquitous Language

A ubiquitous language is a set of terms and expressions that are shared by developers and domain experts, and used consistently throughout the project. A ubiquitous language helps to bridge the gap between the technical and the business worlds, and to ensure that the domain model reflects the true understanding of the domain.

- **Evolving**: constantly refined and updated as the project progresses and new insights are gained
  Contextual: specific to a particular bounded context, and avoid ambiguity or confusion with other contexts or domains
- **Expressive**: rich and precise enough to capture the nuances and subtleties of the domain
- **Implemented**: reflected in the code, the tests, the documentation, and the communication of the project

### Domain Object

A domain object is an object that represents a domain concept or entity in code. It encapsulates the state and behavior of that concept or entity, and enforces its invariants and rules.

- **Encapsulated**: hide its internal implementation details and expose only a well-defined interface to its clients
- **Cohesive**: have a single responsibility and a clear purpose within the domain model
- **Immutable**: should not allow its state to be modified after creation, unless it is part of its domain behavior
- **Identifiable**: have a unique identity that distinguishes it from other objects of the same type

### Value Object

A value object is a type of domain object that represents a simple or atomic value in the domain. It has no identity or lifecycle, and is defined only by its attributes.

- **Immutable**: should not allow its attributes to be changed after creation
- **Equatable**: implement equality based on its attributes, rather than on its identity or reference
- **Replaceable**: should be easily replaced by another value object with the same attributes, without affecting the domain behavior
- **Shareable**: should be safe to share across multiple domain objects or contexts, without causing side effects or inconsistencies

### Entity

An entity is a type of domain object that represents a complex or composite concept or entity in the domain. It has a unique identity and a lifecycle, and may have mutable state.

**Identifiable**: unique identifier that distinguishes it from other entities of the same type
**Mutable**: may allow its state to be changed as part of its domain behavior, but only in a controlled and consistent way
**Consistent**: maintain its invariants and rules at all times, regardless of its state changes
**Aggregateable**: may belong to an aggregate that defines its boundaries and consistency rules

### Context

A context is a boundary or scope within which a particular domain model applies. A context defines what concepts, rules, and behaviors are relevant and meaningful for a specific subdomain or problem space.

- **Bounded**: clear and explicit boundary that separates it from other contexts or domains
- **Consistent**: ensure that the domain model within it is coherent and valid, and does not conflict with other models or contexts
- **Autonomous**: should be independent and self-contained, and not depend on other contexts or domains for its functionality or behavior
- **Integrable**: may communicate or interact with other contexts or domains through well-defined interfaces or protocols

### Aggregate

An aggregate is a cluster of related entities and value objects that form a unit of consistency and transactional integrity. An aggregate defines what entities belong together, what are their invariants and rules, and how they can be accessed or modified.

- **Rooted**: single entity, called the aggregate root, that serves as the entry point and the source of truth for the aggregate
- **Consistent**: ensure that the entities and value objects within it are always in a valid and consistent state, and that their invariants and rules are enforced
- **Isolated**: should not expose its internal entities or value objects to the outside world, and should only allow access or modification through the aggregate root
- **Transactional**: should be treated as a single unit of work or transaction, and should either succeed or fail as a whole

### Repository

A repository is an abstraction that provides access to the aggregates or entities of a domain model. A repository hides the details of how the aggregates or entities are stored, retrieved, or persisted, and provides a collection-like interface to manipulate them.

- **Abstract**: define an interface that specifies what operations are available for the aggregates or entities, without exposing how they are implemented
- **Concrete**: provide one or more implementations that realize the interface using different technologies or mechanisms, such as databases, files, web services, etc.
- **Consistent**: ensure that the aggregates or entities returned by the repository are always in a consistent state, and reflect the latest changes made to them
- **Queryable**: allow querying or filtering the aggregates or entities based on various criteria or specifications

### Domain Event

A domain event is an object that represents something meaningful or significant that happened in the domain. A domain event captures the state and context of the event, and may trigger some actions or reactions in response to it.

- **Immutable**: should not allow its state or context to be changed after creation
- **Descriptive**: describe what happened in the domain, using a clear and expressive name and attributes
- **Observable**: should be published or broadcasted to interested parties or subscribers, using an event bus, a message broker, or other mechanisms
- **Reactive**: may trigger some actions or reactions in response to it, such as updating the domain state, sending notifications, invoking services, etc.

### Domain Service

A domain service is an object that performs some domain-specific operation or logic that does not belong to any entity or value object. A domain service encapsulates some complex or cross-cutting functionality that is needed by the domain model, but is not part of its natural behavior.

- **Stateless**: should not have any state or dependencies of its own, and should only rely on the parameters or inputs provided to it
- **Functional**: perform a single function or operation, and return a result or output
- **Injectable**: should be easily injected or provided to the entities or value objects that need it, using dependency injection, service locator, or other techniques
- **Testable**: should be easy to test and verify its correctness and behavior using automated tests

### Commandos

A commando is an object that represents a request or an intention to perform some action or change some state in the domain. A commando encapsulates the data and context needed to execute the action or change, and may also specify some validation rules or preconditions.

- **Immutable**: should not allow its data or context to be changed after creation
- **Validatable**: may implement some validation rules or preconditions that must be satisfied before executing the action or change
- **Executable**: may implement some logic to execute the action or change itself, using a command handler, a mediator, or other mechanisms
- **Auditable**: may record some information about when, where, how, and by whom it was executed

### Factories

A factory is an object that creates other objects. A factory encapsulates the logic and details of how to instantiate and initialize an entity, a value object, an aggregate, a commando, a domain event, or any other object needed by the domain model.

- **Abstract**: It may define an interface that specifies what objects can be created by the factory, without exposing how they are created
- **Concrete**: It may provide one or more implementations that realize the interface using different strategies or parameters
- **Simple**: It should only create objects and not perform any other actions or side effects
- **Configurable**: It may allow customizing some aspects of how the objects are created, such as their initial state, dependencies, settings, etc.

## Practicies

### Identify and Define the Core Business Domain

The first step in DDD is to identify and define the core business domain. This involves understanding the primary objects of interest in the domain and defining the domain model and its behavior.

- **Identify the primary objects of interest in the domain**: The primary objects of interest are the entities, value objects, and domains that are critical to the business. For example, in a banking application, the primary objects of interest might include customers, accounts, transactions, and payments
- **Define the domain model and its behavior**: Once the primary objects of interest have been identified, the next step is to define the domain model and its behavior. This involves defining the attributes and behaviors of the entities and value objects, as well as the relationships between them. For example, a customer might have a name, address, and account balance, while an account might have a balance, account number, and owner

### Create a Ubiquitous Language

A ubiquitous language is a shared language used by all stakeholders to communicate about the domain. This involves defining a common vocabulary and set of concepts that can be used by developers, domain experts, and stakeholders to discuss the domain.

- **Define a shared language used by all stakeholders**: The language should be based on the domain model and its behavior, and should be easy to understand and use. For example, in a banking application, the language might include terms like “customer,” “account,” “transaction,” and “payment”
- **Use the language to communicate about the domain**: The language should be used consistently across the entire development process, from requirements gathering to design, implementation, and testing. This helps ensure that everyone involved in the project is on the same page and can communicate effectively

### Object-Relational Mapping (ORM) Tools

ORM tools allow developers to map the domain model to a relational database, making it easier to work with the data in the domain model.

- **Use ORM tools to map the domain model to a relational database**: ORM tools like Hibernate, Entity Framework, and Django ORM provide a way to map the domain model to a relational database, making it easier to interact with the data in the domain model
- **Use the ORM tools to abstract the underlying data storage technology**: By using an ORM tool, developers can work with the domain model directly, without having to worry about the underlying data storage technology. This makes it easier to change the data storage technology if needed, without affecting the rest of the application

### Command-Query Responsibility Segregation (CQRS)

CQRS is a pattern that separates the responsibilities of a system into two parts: commands and queries.

- **Use CQRS to separate the responsibilities of a system into two parts**: Commands are used to update the domain model, while queries are used to retrieve data from the domain model. This helps ensure that the system remains scalable and maintainable
- **Use commands to update the domain model**: Commands are used to update the domain model by creating, updating, or deleting entities and value objects. For example, a “Create Customer” command might be used to create a new customer in the system
- **Use queries to retrieve data from the domain model**: Queries are used to retrieve data from the domain model, such as retrieving a list of customers or the balance of a specific account

### Event Sourcing

Event sourcing is a pattern that involves storing the history of the domain model in the form of events.

- **Use event sourcing to store the history of the domain model**: Events are used to record changes to the domain model over time, providing a complete history of the changes made to the system. This allows developers to reconstruct the domain model at a later time, making it easier to audit and debug the system
- **Use events to reconstruct the domain model at a later time**: By replaying the events, developers can reconstruct the domain model at a later time, allowing them to see how the system evolved over time

### Bounded Context

Bounded Context is a key concept in DDD that helps manage the complexity of large models and teams. It defines the boundaries within which a specific subdomain is applicable, and outside of which it may not make sense. Entities can have different names in different contexts. Changes within a bounded context don’t necessitate changes to the entire system, hence developers often use adapters between contexts to maintain this isolation.

- **Use bounded context to define the boundaries of a domain**: Bounded context involves defining the boundaries of a domain, such as the limits of a specific business capability or the scope of a particular project. This helps ensure that the domain model remains relevant and useful, and avoids unnecessary complexity
- **Use bounded context to ensure that the domain model remains relevant and useful**: By defining the boundaries of a domain, developers can ensure that the domain model remains relevant and useful

### Microservices

Microservices are a way to break down a large system into smaller, more manageable parts.

- **Use microservices to break down a large system into smaller, more manageable parts**: Microservices allow developers to build, deploy, and scale individual parts of the system independently, making it easier to maintain and evolve the system over time
- **Use microservices to provide a way to develop, deploy, and scale individual parts of the system independently**: By breaking down a large system into smaller, more manageable parts, developers can work on each part independently, making it easier to develop, deploy, and scale the system

### Messaging

Messaging is a pattern that involves sending messages between objects or systems.

- **Use messaging to send messages between objects or systems**: Messaging allows objects or systems to communicate with each other, enabling loosely coupled architecture. This makes it easier to change or replace individual parts of the system without affecting the rest of the system
- **Use messaging to enable loosely coupled architecture**: By using messaging, developers can build systems that are loosely coupled

## Conclusion

DDD is not a silver bullet for software development. It requires a lot of effort and collaboration to create effective domain models that capture the essence of the problem space.

However, DDD can be very rewarding for complex domains where the model provides clear benefits in formulating a common understanding of the domain and solving its challenges.
