import { test } from 'mocha'
import { expect } from 'chai'
import { tinyparse } from '../src'

test('can use a function directly', () => {
  const intParser = tinyparse({
    value: (v: unknown) => Math.round(Number(v)),
  })

  const result = intParser({ value: '1' })

  expect(result).to.eql({
    value: 1,
  })
})

test('recursive object parse', () => {
  const intParser = tinyparse({
    value: (v: unknown) => Math.round(Number(v)),
  })

  const recursiveParse = tinyparse({
    intA: intParser,
  })

  const result = recursiveParse({ intA: { value: '1' } })

  expect(result).to.eql({
    intA: {
      value: 1,
    },
  })

  const _typechecks = result as { intA: { value: number } }

  //@ts-expect-error
  let _typecheckFail = result as { intA: { value: string } }
})

test('includes null fields', () => {
  const parser = tinyparse({
    nullable: (v: unknown) => v || null,
  })

  expect(parser({ nullable: 0 })).to.eql({ nullable: null })
})

test('throws reasonable error on nested parse failure', () => {
  const onlyOdd = tinyparse({
    value: (x: unknown) => {
      const n = Number(x)
      if (n % 2 !== 1) throw new Error('not odd')
      return n
    },
  })

  const odds = tinyparse({
    a: onlyOdd,
    b: onlyOdd,
  })

  try {
    odds({ a: { value: 2 }, b: { value: 4 } })
  } catch (e) {
    expect(e.fields).to.eql({
      'a.value': 'not odd',
      'b.value': 'not odd',
    })
    return
  }
  throw new Error('should have thrown')
})

test('does not include undefined fields', () => {
  const parser = tinyparse({
    undefable: (v: unknown) => v || undefined,
  })
  expect(parser({ undefable: 0 })).to.eql({})
})

test('enum parsing', () => {
  enum Instruments {
    guitar,
    bass,
    drums = 'trapkit',
  }

  type Enumlike = {
    [id: string]: string | number
    [nu: number]: string
  }

  const parseEnum = <E extends Enumlike>(e: E) => {
    const values = Object.values(e)
    return (value: any) => {
      if (values.includes(value)) return value as E
      throw new Error()
    }
  }

  const parser = tinyparse({
    instrument: parseEnum(Instruments),
  })

  expect(parser({ instrument: Instruments.drums })).to.eql({
    instrument: Instruments.drums,
  })

  expect(parser({ instrument: Instruments.guitar })).to.eql({
    instrument: Instruments.guitar,
  })
})
