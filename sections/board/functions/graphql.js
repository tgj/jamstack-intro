const apolloLambda = require('apollo-server-lambda');
const admin = require("firebase-admin");
const serviceAccount = require("../syt-message-boards-firebase-adminsdk-c8v4x-0ef7594166.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://syt-message-boards.firebaseio.com"
});

const typeDefs = require('./schema.gql');
const _ = require('lodash');
const gprc = require('@grpc/grpc-js');

const {
    ApolloServer,
    UserInputError
} = apolloLambda;

const database = admin.firestore();

const resolvers = {
    Query: {
      messages: () =>
        database
          .ref("messages")
          .once("value")
          .then(snap => snap.val())
          .then(val => Object.keys(val).map(key => val[key]))
    },
    Mutation: {
        addMessage: async (root, { message }) => {
            const validationErrors = {};

            const compactMessage = _.pickBy(message);

            if(!compactMessage.email) {
                validationErrors.email = 'Email field is required.'
            }
            
            if (!compactMessage.content) {
                validationErrors.content = 'Message field is required.'
            }

            if (Object.keys(validationErrors).length > 0) {
                throw new UserInputError(
                  'Failed to get events due to validation errors',
                  { validationErrors }
                );
            }

            await database.ref('messages/').push(compactMessage);
            return compactMessage;
        }
    }
  };

const server = new ApolloServer({
    typeDefs,
    resolvers
});

exports.handler = server.createHandler();