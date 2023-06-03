type Converter = (x: any) => any

type Tinyparser<Result> = (input: unknown) => Result

type ObjectSchema = Readonly<Record<string, Function>>

type Result<S extends ObjectSchema> = {
  [K in keyof S]: S[K] extends Converter ? ReturnType<S[K]> : never
}

export const tinyparse = <S extends Readonly<ObjectSchema>>(
  schema: S
): Tinyparser<Result<S>> => {
  const converters = Object.keys(schema).map((key) => ({
    key,
    fn:
      typeof schema[key] === 'function'
        ? (schema[key] as Converter)
        : ((schema[key] as any).parse as Converter),
  }))

  return (input: unknown) => {
    if (typeof input !== 'object')
      throw new Error(`Invalid input. Expected object but got ${typeof input}.`)

    let res: any = {}
    const fields: Record<string, string> = {}
    const messages: string[] = []

    for (let { key, fn } of converters) {
      try {
        const val = fn(input[key])
        if (typeof val !== 'undefined') res[key] = val
      } catch (e) {
        const m = e.message || e
        if (e.fields) {
          for (let f of Object.keys(e.fields)) {
            fields[`${key}.${f}`] = e.fields[f]
          }
        } else {
          fields[key] = m
        }
        messages.push(`${key}: ${m}`)
      }
    }

    if (messages.length) {
      const e = new Error(`Invalid input. ${messages.join(', ')}.`) as any

      e.fields = fields
      throw e
    }

    return res as Result<S>
  }
}
