/* An OrderedMap represents a Map which allows array-style indexing over the keys
 * While the normal map keeps insertion order, this gives an easier way to access arbitrary indicies without using iterators */
class OrderedMap<K, V> {
  map: Map<K, V> = new Map()
  order: K[] = []

  append(key: K, value: V): void {
    this.map.set(key, value)
    this.order.push(key)
  }

  prepend(key: K, value: V): void {
    this.map.set(key, value)
    this.order.unshift(key)
  }

  has(key: K): boolean {
    return this.map.has(key)
  }

  get(key: K): V {
    return this.map.get(key)
  }

  getAt(index: number): V {
    return this.map.get(this.order[index])
  }
  
  getPairAt(index: number): [K, V] {
    const mapKey = this.order[index]
    return [mapKey, this.map.get(mapKey)]
  }

  getKeyAt(index: number): K {
    return this.order[index]
  }

  getKeys(): K[] {
    return this.order
  }

  forEach(fn: (value: V, key: K, map: Map<K, V>) => void): void {
    this.map.forEach(fn)
  }

  indexOf(key: K) {
    return this.order.indexOf(key)
  }

  delete(key: K) {
    const index = this.order.indexOf(key)
    if (index === -1) return false;
    this.order.splice(index, 1)
    return this.map.delete(key)
  }

  deleteAt(index: number) {
    const mapKey = this.order[index]
    this.order.splice(index, 1)
    return this.map.delete(mapKey)
  }

  clear(): void {
    this.map.clear()
    this.order = []
  }

  get length(): number {
    return this.order.length
  }
}

export { OrderedMap }