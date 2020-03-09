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
        addMessage: async (root, { input }) => {
            const validationErrors = {};

            const compactMessage = _.pickBy(input);

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
        approveMessage: async (root, { input }) => {
            const messageTable =  database.ref('messages');
            const messageApprovalTable =  database.ref('messageApprovals');

            const confirmationCode = md5(input.approvalId);
            const approvalRecords = await messageApprovalTable
                .orderByChild('code')
                .equalTo(confirmationCode)
                .once('value');

            const data = approvalRecords.val();
            const makeys = Object.keys(data);
            const recordLength = makeys.length;

            if (recordLength === 1) {
                const record = data[makeys[0]];
                const shouldLookupAssociatedMessage = 
                    !record.approvedAt && 
                    record.code === confirmationCode;
                
                if (shouldLookupAssociatedMessage) {

                    const messages = await messageTable
                        .orderByChild('id')
                        .equalTo(record.message)
                        .once('value');
                    
                    const messageData = messages.val();
                    const messageKeys = Object.keys(messageData);
                    const messageDataLength = messageKeys.length;

                    if (messageDataLength === 1) {

                        await messageApprovalTable.child(makeys[0]).update({
                            'approvedAt': new Date().toISOString()
                        }, () => {
                            console.log('message approval update complete');
                        });

                        await messageTable.child(messageKeys[0]).update({
                            'approvedAt': new Date().toISOString()
                        }, data => {
                            console.log('message update complete')
                        });

                        return {
                            approved: true
                        };

                    } else {
                        throw new InternalError(
                            'Unable to approve message'
                        );
                    }
                }
            }

            return {
                approved: false
            };
        }
    }
  };

const server = new ApolloServer({
    typeDefs,
    resolvers
});

exports.handler = server.createHandler();