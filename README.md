# First-In-Fuck-You Queue

A First-In-Fuck-You (FIFU) queue behaves almost identically to a traditional
First-In-First-Out (FIFO) queue, with the notable exception that elements are
silently removed from the queue after they have been in it for a set period of
time.

There is no way to interrogate the queue to tell if an item has been dropped,
and no notification system is available to callers to know when their items have
been dropped.

This is inspired by the Quest Diagnostics sign-up system for walk-in labs, which
uses a similar approach to silently remove patients who have been waiting longer
than an hour.

They typical queue method `peek` is not implemented, you can't know you're at
the front of the line until the phlebotomist calls for you.

## Usage

```ts
import FIFUQueue from "fifu-queue";

const queue = new FIFUQueue(); // create a new queue with the default TTL of one hour;
queue.add(1, 2, 3);
queue.pop(); // 1
queue.pop(); // 2

// more than an hr passes, 3 is dropped
queue.add(4);
queue.pop(); // 4
```
