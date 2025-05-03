import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloServer } from 'apollo-server-express';
import { readFileSync } from 'fs';
import { join } from 'path';
import connectDB from './config/db';
import resolvers from './resolvers';

dotenv.config();

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  connectDB();

  const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf-8');

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({}),
  });

  await server.start();
  
  server.applyMiddleware({ app: app as any });

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
});