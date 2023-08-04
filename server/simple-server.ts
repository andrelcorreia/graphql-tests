import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";

const { Users } = require("./src/dbUsers.js");
const { Todo } = require("./src/dbTodo.js");

async function startServer() {
  const app = express();
  const server = new ApolloServer({
    typeDefs: `
        type User {
          id: ID!
          name: String!
          username: String!
          email: String!
          phone: String!
          website: String!
        }
        type Todo {
          id: ID!
          title: String!
          completed: Boolean
          user: User
        }

        type Query {
          getTodos: [Todo]
          getAllUsers: [User]
          getUser(id: ID!): User
          getByUserName(name: String!): User
        }
    `,
    resolvers: {
      Todo: {
        user: async (parent, { id }) => Users.find((e: any) => e.id === id),
      },
      Query: {
        getTodos: () => Todo,
        getAllUsers: () => Users,
        getUser: async (parent, { id }) => Users.find((e: any) => e.id === id),
        getByUserName: async (parent, { name }) =>
          (
            await axios.get(
              `https://jsonplaceholder.typicode.com/users/${name}`
            )
          ).data,
      },
    },
  });

  app.use(bodyParser.json());
  app.use(cors());

  await server.start();

  app.use("/graphql", expressMiddleware(server));

  app.listen(8000, () => console.log(`HTTP server running on port 8000`));
}

startServer();
