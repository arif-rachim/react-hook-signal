/**
 * Represents a todo item with various properties.
 *
 * @interface Todo
 * @property {string} id - The unique identifier of the todo item.
 * @property {string} title - The title of the todo item.
 * @property {string} description - The description of the todo item.
 * @property {'Pending' | 'On Going' | 'Completed'} status - The status of the todo item.
 * @property {Date} dueDate - The due date of the todo item.
 * @property {Date} lastUpdate - The last update timestamp of the todo item.
 * @property {'High' | 'Medium' | 'Low'} priority - The priority of the todo item.
 * @property {number} progress - The progress of the todo item as a percentage (0-100).
 * @property {Date | undefined} completionDate - The completion date of the todo item, if it has been completed.
 * @property {Date} createdTime - The timestamp when the todo item was created.
 */
export interface Todo {
    id: string,
    title: string,
    description: string,
    status: 'Pending' | 'On Going' | 'Completed',
    dueDate: Date,
    lastUpdate: Date,
    priority: 'High' | 'Medium' | 'Low',
    progress : number,
    completionDate: Date | undefined,
    createdTime: Date,
}