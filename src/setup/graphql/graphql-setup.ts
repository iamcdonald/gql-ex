import { globSync } from "glob";
import path from "path";
import { buildSchema } from "graphql";
import { type FastifyInstance } from "fastify";
import { IResolvers, mercurius } from "mercurius";
import { loadSchemaFiles } from "mercurius-codegen";
import mercuriusValidation from "mercurius-validation";
import { codegen } from "./codegen";

const loadResolvers = async (resolversPath: string): Promise<IResolvers> => {
  const resolvers = await Promise.all(
    globSync(resolversPath).map(async (p) => {
      return import(path.relative(__dirname, path.resolve(p))).then(
        (m) => m.default,
      );
    }),
  );

  return resolvers.reduce(
    (aggs, rs) =>
      Object.keys(rs).reduce((all, type) => {
        const extistingForType = Object.keys(rs[type] || {});
        const newForType = Object.keys(all[type] || {});
        const overlap = extistingForType.find((name) =>
          newForType.includes(name),
        );
        if (overlap) {
          throw new Error(`Duplicate name ('${overlap}') found`);
        }
        return {
          ...all,
          [type]: {
            ...all[type],
            ...rs[type],
          },
        };
      }, aggs),
    {},
  );
};

const loadSchema = (
  server: FastifyInstance,
  schemasPath: string,
  resolvers: IResolvers,
) => {
  const { schema } = loadSchemaFiles(schemasPath, {
    prebuild: {
      targetPath: "./src/setup/graphql/schema.prebuild.json",
    },
    watchOptions: {
      enabled: process.env.NODE_ENV === "development",
      onChange(schema) {
        server.graphql.replaceSchema(
          buildSchema(
            [`${mercuriusValidation.graphQLTypeDefs}\n`]
              .concat(...schema)
              .join("\n"),
          ),
        );
        server.graphql.defineResolvers(resolvers);
        codegen(server);
      },
    },
  });
  return [`${mercuriusValidation.graphQLTypeDefs}\n\n`].concat(...schema);
};

export default async (
  server: FastifyInstance,
  {
    schemas: schemasPath,
    resolvers: resolversPath,
  }: {
    schemas: string;
    resolvers: string;
  },
) => {
  const resolvers = await loadResolvers(resolversPath);
  const schema = loadSchema(server, schemasPath, resolvers);

  server.register(mercurius, {
    schema,
    resolvers,
  });
  server.register(mercuriusValidation);

  codegen(server);
};
