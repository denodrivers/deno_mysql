export interface Deferred<T> {
  promise: Promise<T>
  resolve: (t?: T) => void
  reject: (e?: any) => void
}

export interface DeferredStackItemCreator<T> {
  (): Promise<T>
}

export function defer<T>(): Deferred<T> {
  let reject: (arg?: any) => void
  let resolve: (arg?: any) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return {
    promise,
    reject: reject!,
    resolve: resolve!
  }
}

export class DeferredStack<T> {
  private _queue: Deferred<T>[] = []
  private _size = 0;
  constructor(
    readonly poolSize: number,
    private _array: T[] = [],
    private readonly create: DeferredStackItemCreator<T>
  ) {
    this._size = _array.length
  }

  get size(): number {
    return this._size
  }

  get length(): number {
    return this._array.length
  }

  async pop(): Promise<T> {
    if (this._array.length) {
      return this._array.pop()!
    } else if (this._size < this.poolSize) {
      this._size++
      const item = await this.create()
      return item
    }
    const d = defer<T>()
    this._queue.push(d)
    await d.promise
    return this._array.pop()!
  }

  async push(item: T) {
    this._array.push(item)
    if (this._queue.length) {
      this._queue.shift()!.resolve()
    }
  }

  reduceSize() {
    this._size--
  }
}
