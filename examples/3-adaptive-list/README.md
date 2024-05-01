# 2-signal-with-hooks

This project is like a copy of the `"1-just-signal"` example. But here, instead of directly making the state and computed 
values, we're using hooks called `useSignal` and `useComputed`. We're doing this because if we don't use hooks, there's a 
chance that the connection between things might get lost when a component refreshes. By using hooks to create signals or 
computed values, we avoid this problem. So, our React components work smoothly even when they refresh.
