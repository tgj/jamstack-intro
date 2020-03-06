const apolloLambda = require('apollo-server-lambda');
const firebase = require('firebase');
const typeDefs = require('./schema.gql');
const _ = require('lodash');

const {
    ApolloServer,
    UserInputError
} = apolloLambda;

const firebaseConfig = {
    apiKey: "AIzaSyC9rNHlFcidcdRlskyQQAejaQYwjOEdlNA",
    authDomain: "syt-message-boards.firebaseapp.com",
    databaseURL: "https://syt-message-boards.firebaseio.com",
    projectId: "syt-message-boards",
    storageBucket: "syt-message-boards.appspot.com",
    messagingSenderId: "319927989043",
    appId: "1:319927989043:web:96847d4f5064d4b81b8446",
    measurementId: "G-SP16Z4Q2S0"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

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