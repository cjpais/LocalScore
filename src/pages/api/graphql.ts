// import client from "@/db";
// import { ApolloServer } from "@apollo/server";
// import { startServerAndCreateNextHandler } from "@as-integrations/next";
// import { buildSchema } from "drizzle-graphql";

// import * as dbSchema from "@/db/schema";
// import { drizzle } from "drizzle-orm/node-postgres";

// const db = drizzle({ client, schema: dbSchema });
// const { schema } = buildSchema(db);

// const server = new ApolloServer({
//   schema,
// });

// export default startServerAndCreateNextHandler(server);

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { createYoga } from "graphql-yoga";

import * as dbSchema from "@/db/schema";
import { buildSchema } from "drizzle-graphql";
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle({ schema: dbSchema });

const { schema } = buildSchema(db);

export default createYoga<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  schema,
  // Needed to be defined explicitly because our endpoint lives at a different path other than `/graphql`
  graphqlEndpoint: "/api/graphql",
});
