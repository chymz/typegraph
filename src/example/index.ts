import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as koaBody from 'koa-bodyparser';
import { graphqlKoa } from 'apollo-server-koa';
import { GraphQLID, printSchema } from 'graphql';
import { koa as voyager } from 'graphql-voyager/middleware';

import { GraphQLSchema } from 'graphql';
import { writeFileSync } from 'fs';
import { TypeGraph } from '../TypeGraph';
import { RootQuery } from './RootQuery';
import { RootMutation } from './RootMutation';
import graphPlayground from 'graphql-playground-middleware-koa';
import { Connection, createConnection } from 'typeorm';

(async () => {
  const db: Connection = await createConnection({
    type: 'sqlite',
    database: 'database.db',
    logging: false,
    synchronize: true,
    entities: ['src/**/*Entity.ts'],
  });

  const schema = new GraphQLSchema({
    query: TypeGraph.toGraphQL(RootQuery),
    mutation: TypeGraph.toGraphQL(RootMutation),
  });

  writeFileSync('schema.graphql', printSchema(schema));

  const app = new koa();
  const router = new koaRouter();

  const port = 3000;
  const host = '0.0.0.0';

  const graphQLRequest = async (ctx: koa.Context) => {
    return {
      schema,
      context: {
        db,
        ctx,
      },
    };
  };

  // GraphQL API
  router.post('/graphql', koaBody(), graphqlKoa(graphQLRequest));
  router.get('/graphql', graphqlKoa(graphQLRequest));

  // Utils UI
  router.all('/voyager', voyager({ endpointUrl: '/graphql', displayOptions: {} }));
  router.all('/playground', graphPlayground({ endpoint: '/graphql' }));

  app.use(router.routes());
  app.use(router.allowedMethods());
  app.listen(port, host);

  console.log(`API:\t\thttp://${host}:${port}/graphql`);
  console.log(`Playground:\thttp://${host}:${port}/playground`);
  console.log(`Voyager:\thttp://${host}:${port}/voyager`);
})().catch(err => console.error(err));
