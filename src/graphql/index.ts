import "./generated-types";
import inventory from "./inventory";

const defs = [inventory];

const resolvers = defs.reduce(
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

export { resolvers };
