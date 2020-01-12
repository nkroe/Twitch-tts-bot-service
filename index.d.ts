interface EventHandle<T> {
  (data: T): void;
}

interface EventHandler<TInput = {}, TData> {
  (input?: TInput): EventHandle<TData>;
}
