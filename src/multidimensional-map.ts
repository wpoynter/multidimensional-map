import OrderedMap from './ordered-map'

export interface DimensionCollection<T> {
  [key: string]: OrderedMap<string | number, T>
}

export type QueryRange<T> = [T, T]

export interface MatchQuery<T> {
  [dimension: string]: T | QueryRange<T>
}

/* Gets the intersection of the Array type (not Set)
 * Implementation assumes that array items are unique */
function getArrayIntersection<T>(...sets: (T[])[]) {
  const numOfAppearances = new Map<T, number>()
  sets.forEach(set => {
    set.forEach(item => {
      if (!numOfAppearances.has(item))
        numOfAppearances.set(item, 0)
      const incrementedValue = numOfAppearances.get(item) + 1
      numOfAppearances.set(item, incrementedValue)
    })
  })
  const intersection: T[] = []
  numOfAppearances.forEach((count, item) => {
    if (count === sets.length) intersection.push(item)
  })
  return intersection
}

class MultidimensionalMap<EntryT> {
  dimensions: DimensionCollection<EntryT[]>
  entries: EntryT[] = []

  constructor(dimensions: string[]) {
    this.dimensions = dimensions.reduce((acc: DimensionCollection<EntryT[]>, curr: string) => {
      acc[curr] = new OrderedMap<string | number, EntryT[]>()
      return acc
    }, {})
  }

  addEntries(entries: EntryT[]): void {
    entries.forEach(entry => {
      this.entries.push(entry)
      Object.keys(this.dimensions).forEach(dimension => {
        const entryValueForDimension = entry[dimension]
        const dimensionMap = this.dimensions[dimension]
        if (!dimensionMap.has(entryValueForDimension)) {
          dimensionMap.append(entryValueForDimension, [])
        }
        dimensionMap.get(entryValueForDimension).push(entry)
      })
    })
  }

  getAllEntries(): EntryT[] {
    return this.entries
  }

  getEntriesInRange(dimension: string, start: string | number, end: string | number): EntryT[] {
    if (start === end) return this.dimensions[dimension].get(start) 
    let withinRange: boolean = false
    const entryList: EntryT[] = []
    this.dimensions[dimension].forEach((entries, item) => {
      if (withinRange) {
        if (item === end) withinRange = false
        entryList.push(...entries)
      }
      else if (!withinRange && item === start) {
        withinRange = true
        entryList.push(...entries)
      }
    })
    return entryList
  }

  getSubset(query: MatchQuery<string | number>): EntryT[] {
    const subsets = Object.entries(query).map(([dimensionName, dimensionItem]) => {
      if (Array.isArray(dimensionItem)) {
        const [start, end] = dimensionItem
        return this.getEntriesInRange(dimensionName, start, end)
      }
      return this.dimensions[dimensionName].get(dimensionItem as number | string)
    })
    return getArrayIntersection(...subsets)
  }

  combineEntries (dataEntries: EntryT[], measure: keyof EntryT, fields: string[]) {
    if (dataEntries.length === 0) return []
    const nestedEntries = {}
    dataEntries.forEach(dataEntry => {
      let current = nestedEntries
      fields.forEach((subfield, idx) => {
        if (current[dataEntry[subfield]] == null) {
          if (idx >= fields.length - 1) {
            const subset = { [measure]: dataEntry[measure] }
            fields.forEach(subfield => { subset[subfield] = dataEntry[subfield] })
            current[dataEntry[subfield]] = subset
          } else {
            current[dataEntry[subfield]] = {}
          }
        } else {
          if (idx >= fields.length - 1) {
            current[dataEntry[subfield]][measure] += dataEntry[measure]
          }
        }
        current = current[dataEntry[subfield]]
      })
    })
    return nestedEntries
  }

  get length() {
    return this.entries.length
  }
}

export default MultidimensionalMap 