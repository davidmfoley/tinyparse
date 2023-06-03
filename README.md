# tinyparse

A tiny parser for untrusted input. One function. No dependencies.

Use tinyparse to convert json data from the big bad internet into 
a type-checked, validated object.



## Usage

```typescript
const parse = tinyparse({
  name: (x: unknown) => {
    assert.equal(typeof x, 'string')
    return x.toUpperCase()
  },
  age: (x: unknown) => Number(x)
})

const result = parse({
  name: 'arthur',
  age: '42'
}

console.log(result)
// => {name: 'Arthur', age: 42 }

//type of result is { name: string, age: number }



 
```



