const ONE_HOUR = 60 * 60 * 1000;

interface QueuedItem<T> {
  item: T;
  queuedAt: number;
  timeoutId: number | NodeJS.Timeout;
}

/**
 * First-In-Fuck-You Queue. Operates like a FIFO queue, but will remove items
 * silently after a certain period of time.
 */
export class FIFUQueue<T> {
  #items: QueuedItem<NonNullable<T>>[];
  #ttl: number;

  /**
   * The number of items currently in the list
   */
  get size(): number {
    return this.#items.length;
  }

  /**
   * Boolean indicating that the queue is empty
   */
  get empty(): boolean {
    return this.size === 0;
  }

  /**
   * Construct a new FIFUQueue instance
   *
   * @param items The initial set of items with which to populate the queue
   * @param ttl The max amount of time in milliseconds that an item can be in
   *            the queue. After this time, it is silently removed.
   */
  constructor(items: readonly NonNullable<T>[] = [], ttl: number = ONE_HOUR) {
    this.#ttl = ttl;
    this.#items = [];
    this.add(...items);
  }

  /**
   * Adds one or more items to the queue, in the order that they are provided.
   *
   * @param items The items to add to the queue
   */
  public add(...items: readonly NonNullable<T>[]): void {
    for (const item of items) {
      const queuedAt = Date.now();
      const timeoutId = setTimeout(() => {
        this.#removeItem(wrapped);
      }, this.#ttl);
      const wrapped = { item, queuedAt, timeoutId };
      this.#items.push(wrapped);
    }
  }

  /**
   * Removes and returns the item at the front of the queue. Returns null if
   * the queue is empty
   *
   * @returns The item at the front of the queue, or null if the queue is empty
   */
  public pop(): T | null {
    let queuedItem: QueuedItem<NonNullable<T>> | undefined;
    while ((queuedItem = this.#items.shift())) {
      if (this.#hasExpired(queuedItem)) {
        continue;
      }
      return queuedItem.item;
    }
    return null;
  }

  #hasExpired(queuedItem: QueuedItem<unknown>): boolean {
    return Date.now() > queuedItem.queuedAt + this.#ttl;
  }

  #removeItem(queuedItem: QueuedItem<T>): void {
    this.#items = this.#items.filter((item) => item !== queuedItem);
  }
}
