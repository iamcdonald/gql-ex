import Fastify, { FastifyInstance } from "fastify";
import { buildSchema } from "graphql";
import mercurius from "mercurius";
import { codegenMercurius, loadSchemaFiles } from "mercurius-codegen";
import { resolvers } from "./graphql";

const codegen = (server: FastifyInstance) =>
  codegenMercurius(server, {
    targetPath: "./src/graphql/generated-types.ts",
    watchOptions: {
      enabled: process.env.NODE_ENV === "development",
    },
  }).catch(console.error);

const server = Fastify();

const { schema } = loadSchemaFiles("src/graphql/**/*.gql", {
  watchOptions: {
    enabled: process.env.NODE_ENV === "development",
    onChange(schema) {
      server.graphql.replaceSchema(buildSchema(schema.join("\n")));
      server.graphql.defineResolvers(resolvers);
      codegen(server);
    },
  },
});

server.register(mercurius, {
  schema,
  resolvers,
});

codegen(server);

export default server;
