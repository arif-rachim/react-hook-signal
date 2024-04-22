
export interface Todo {
    id : string,
    title: string,
    description: string,
    status: 'Pending' | 'On Going' | 'Completed',
    dueDate: Date,
    lastUpdate : Date,
    priority: 'High' | 'Medium' | 'Low',
    completionDate: Date,
    createdTime: Date,
}