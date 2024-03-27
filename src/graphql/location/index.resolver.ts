import { IResolvers } from "mercurius";

const location: NonNullable<IResolvers["Query"]>["location"] = (_, { id }) => {
  return {
    id,
    name: "Space One",
    listed: true,
    capacity: 34,
  };
};

const resolvers: IResolvers = {
  Query: {
    location,
  },
};

export default resolvers;
