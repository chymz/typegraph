import { Connection, createConnection } from 'typeorm';
import { TypeGraph } from '../TypeGraph';
import { RootMutation } from './RootMutation';
import { RootQuery } from './RootQuery';
import { IResolveContext } from '../interfaces/IResolveContext';

(async () => {
  const db: Connection = await createConnection({
    database: 'database.db',
    entities: ['src/**/*Entity.ts'],
    logging: false,
    synchronize: true,
    type: 'sqlite',
  });

  const server = new TypeGraph({
    context: {
      db,
    },
    mutation: RootMutation,
    playground: true,
    query: RootQuery,
    voyager: true,
  });

  server.addResolveMiddleware(TypeGraph.argsToInstance);

  server.start();

  // tslint:disable-next-line
})().catch(err => console.error(err));
