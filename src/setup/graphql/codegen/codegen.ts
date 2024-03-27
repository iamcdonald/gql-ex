import { FastifyInstance } from "fastify/types/instance";
import { codegenMercurius } from "mercurius-codegen";

const codegen = (server: FastifyInstance) =>
  codegenMercurius(server, {
    targetPath: "./src/setup/graphql/codegen/gql.types.ts",
    watchOptions: {
      enabled: process.env.NODE_ENV === "development",
    },
    outputSchema: false,
  }).catch(console.error);

export default codegen;
