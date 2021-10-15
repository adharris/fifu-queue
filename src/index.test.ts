import { FIFUQueue } from "./index";

beforeAll(() => {
  jest.useFakeTimers("modern");
});

afterAll(() => {
  jest.restoreAllMocks();
});

const minutes = (min: number) => min * 60 * 1000;

function* drain<T>(queue: FIFUQueue<T>): Iterable<T> {
  let item: T | null;
  while ((item = queue.pop())) {
    yield item;
  }
}

describe("FIFUQueue", () => {
  it("should default to 0 items", () => {
    const queue = new FIFUQueue();
    expect(queue.size).toBe(0);
    expect(queue.empty).toBe(true);
  });

  it("should accept initial items from the constructor", () => {
    const queue = new FIFUQueue(["a", "b", "c", 12]);
    const items = Array.from(drain(queue));
    expect(items).toEqual(["a", "b", "c", 12]);
  });

  it("should remove items on pop()", () => {
    const queue = new FIFUQueue([1, 2, 3]);
    const first = queue.pop();
    const rest = Array.from(drain(queue));
    console.log(rest);
    expect(first).toBe(1);
    expect(rest).toEqual([2, 3]);
  });

  it("should add items to the end", () => {
    const queue = new FIFUQueue([1, 2, 3]);
    expect(queue.size).toBe(3);
    queue.add(11, 22, 33);
    expect(queue.size).toBe(6);
    expect(Array.from(drain(queue))).toEqual([1, 2, 3, 11, 22, 33]);
  });

  it("should pop null when the queue is empty", () => {
    const queue = new FIFUQueue();
    expect(queue.pop()).toBeNull();
  });

  it("should remove items after they have been in the queue for an hour", () => {
    const queue = new FIFUQueue();
    queue.add(1);
    jest.advanceTimersByTime(minutes(5));
    queue.add(2);
    jest.advanceTimersByTime(minutes(5));
    console.log(new Date());
    queue.add(3);

    jest.advanceTimersByTime(minutes(45));
    expect(queue.pop()).toBe(1);

    jest.advanceTimersByTime(minutes(10));
    console.log(new Date());
    expect(queue.pop()).toBe(3);
  });

  it("should allow you to set the TTL", () => {
    const queue = new FIFUQueue([1], 1000);
    jest.advanceTimersByTime(500);
    queue.add(2, 3);
    jest.advanceTimersByTime(500);
    queue.add(4);
    expect(queue.pop()).toBe(2);
    expect(queue.pop()).toBe(3);
    jest.advanceTimersByTime(1000);
    expect(queue.empty).toBeTruthy();
    expect(queue.pop()).toBeNull();
  });
});
