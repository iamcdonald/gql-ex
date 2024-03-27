import Fastify from "fastify";
import graphql from "./setup/graphql";

const server = Fastify();

await graphql(server, {
  schemas: "./src/graphql/**/*.gql",
  resolvers: "./src/graphql/**/*.resolver.ts",
});

export default server;
