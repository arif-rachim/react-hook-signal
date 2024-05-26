# Todo List

## Introduction

The Todo List project is a basic to-do application constructed as a demonstration of integrating React with 'signals' using Notifiable components. The primary aim of this project is to be simple, performant, and lightweight.

Reactive programming is a paradigm that's been gaining quite a bit of attention lately. In this paradigm, signals form a central concept. This project leverages these concepts within a React and TypeScript environment, showing the strength of combining strong static typing and reactive programming.

![Solving rerendering problem in react using signal](https://github.com/arif-rachim/react-hook-signal/raw/main/assets/todo-list.gif)

## Key Objectives

The Todo List project has some specific objectives:

1. **Simplicity**: One of the main aims of this project is to be simple and straightforward, allowing developers of any level to understand how React, TypeScript, and signals intertwine.

2. **Performance**: In addition to simplicity, the project prioritizes performance, highlighting how the use of signals can contribute to optimizing React's performance by only updating components when necessary.

3. **Lightweight**: By carefully selecting our libraries and using modern JavaScript features, we aim to keep the project lightweight and efficient.

## Core Concepts

### Reactive Programming and Signals

A signal represents a container-like structure encapsulating a value that changes over time. Any modification to the signal's value propagates an update throughout the system, informing all components that are "listening" to those signals.

### Notifiable Components

The Notifiable component is React's way of playing nicely with the philosophy of reactive programming. Each notifiable component keeps track of its state; any changes to that state trigger a rerender of the component and its children. This principle is akin to the update propagation mechanism at the heart of signal usage in reactive programming.

## Why This Approach?

The Todo List project isn't just a showcase of React, TypeScript, and Signals working together, but it also highlights why this trio makes a strong team:

### Efficient Rendering

The application ensures efficient rendering by primarily eliminating unnecessary re-rendering in the UI. This approach is a direct consequence of using signals and notifiable components instead of traditional state-based UI updates. In regular React flow, use of states and effects could trigger multiple re-renderings that aren't always necessary. This can lead to performance degradation, which is especially noticeable in larger applications.

However, in the Todo List project, changes to signals notify the components that depend on them, causing these components to re-render. React components that aren't dependent on a particular signal will not re-render when that signal changes, minimizing unnecessary UI updates. This aspect results in a highly efficient and performant application.

### Lightweight Without Compromising Complexity

Reactive programming also facilitates the building of complex behaviour without relying too much on third-party libraries. This benefit adds to the appeal of this approach, keeping the project lightweight.

For instance, modules that typically require additional libraries, such as virtual lists for displaying large sets of data, forms management, animations, and so on, can be implemented natively using reactive programming concepts. Instead of stateful logic spread across multiple components and libraries which can be heavy and complex to manage, we encapsulate logic within signals.

While third-party libraries do exist to help manage such things, each adds to the load time and complexity of your application. Removing reliance on them where possible not only helps keep the codebase clean and easy to maintain, but it also improves performance and load times, making your application snappier and more responsive to end-users.

This doesn't mean third-party libraries are undesirable. Instead, it underlines the power of reactive programming and how it offers more control to developers. The ability of reactive programming to natively handle complex behaviours highlights its potential, and learning, understanding, and applying these concepts can surely prove beneficial, just like in this Todo List project.