const apolloLambda = require('apollo-server-lambda');
const firebase = require('firebase/app');
require('firebase/database');
const typeDefs = require('./schema.gql');
const _ = require('lodash');
const { GraphQLDateTime } = require('graphql-iso-date');
const {
    ApolloServer,
    UserInputError
} = apolloLambda;
const { uuid } = require('uuidv4');
const md5 = require('md5');

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
    DateTime: GraphQLDateTime,
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

            const finalMessage = {
                ...compactMessage,
                id: uuid(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            await database.ref('messages/').push(finalMessage);

            const approvalCode = uuid();

            const messageApproval = {
                id: uuid(),
                code: md5(approvalCode),
                message: finalMessage.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString() 
            };

            await database.ref('messageApprovals').push(messageApproval);

            return { code: approvalCode };
        },
        approveMessage: async (root, { approval: { code = '' } }) => {
            const messageApprovalTable = await database.ref('messageApprovals');

            const confirmationCode = md5(approval.code);

            const approvalRecords = await messageApprovalTable
                .orderByChild('code')
                .equalTo(confirmationCode)
                .once('value');

            if (approvalRecords.length === 1) {
                const record = approvalRecords[0];
                if (record.code === approval.code) {
                    // Update Message

                    // Update MessageApproval
                }
            }
            
            return false;
        }
    }
  };

const server = new ApolloServer({
    typeDefs,
    resolvers
});

exports.handler = server.createHandler();