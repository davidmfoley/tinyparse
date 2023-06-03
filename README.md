# tinyparse

A tiny typesafe parser for untrusted input.

One function. No dependencies. 1.3kb uncompressed.

Use tinyparse to parse untrusted data from the big bad internet into a typesafe object
- HTTP request bodies
- Data from message queues
- Documents from schemaless storage
- JSON in files
- etc.


## Usage


### Parse an object
```typescript

// set up parser
const parse = tinyparse({
  name: (x: unknown) => {
    assert.equal(typeof x, 'string')
    return x.toUpperCase()
  },
  age: (x: unknown) => {
    const value = Number(x)
    if (value < 0) throw new Error('cannot be negative')
  }
})

// parse takes an object
const result = parse({
  name: 'arthur',
  age: '42'
})

console.log(result)
// => {name: 'Arthur', age: 42 }
//type is { name: string, age: number }

parse({
  name: 'zaphod',
  age: '-100'
})

// => throws error:
// {
//   message: 'Invalid input. age: cannot be negative',
//   fields: {
//     age: 'cannot be negative'
//   }
// }
```

