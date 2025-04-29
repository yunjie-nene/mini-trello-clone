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

  // Connect to database
  connectDB();

  // Add GraphQL server
  // Load GraphQL schema
  const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf-8');

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Add authentication context here if needed
      return {};
    },
  });

  // Start Apollo Server
  await server.start();
  
  // Apply middleware (with type assertion to fix TypeScript error)
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