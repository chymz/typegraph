# Todo list

* Better/Tests Input types (args ?)
* Custom field resolve function

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
