import { TypeGraph } from '../TypeGraph';
import { RootQuery } from './RootQuery';
import { RootMutation } from './RootMutation';
import { Connection, createConnection } from 'typeorm';

(async () => {
  const db: Connection = await createConnection({
    type: 'sqlite',
    database: 'database.db',
    logging: false,
    synchronize: true,
    entities: ['src/**/*Entity.ts'],
  });

  const server = new TypeGraph({
    query: RootQuery,
    mutation: RootMutation,
    playground: true,
    voyager: true,
    context: {
      db,
    },
  });

  server.start();
})().catch(err => console.error(err));
