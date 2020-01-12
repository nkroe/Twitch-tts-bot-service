interface EventHandle<T> {
  (data: T): void;
}

export interface EventHandler<TInput = {}, TData = {}> {
  (input: TInput): EventHandle<TData>;
}