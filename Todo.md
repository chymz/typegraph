# Todo list

* Better/Tests Input types (args ?)
* Custom field resolve function
  * Add args to all resolve, then context `resolve(args: any, context: IResolveContext)`

```ts
@Type()
export class Query {

  @Field(type => String, {
    args: {
      input: {
        type: type => String
        defaultValue: '',
        description: '',
      }
    }
  })
  async someData(context: IResolveContext) {
    // Fetch data ...
    return data;
  }

}
```

* Unit tests
* JSDocs
* Documentation
