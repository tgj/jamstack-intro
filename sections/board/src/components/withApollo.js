import React from 'react';
import 'isomorphic-fetch';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import { createHttpLink } from 'apollo-link-http';

const link = createHttpLink({ uri: '/api/graphql' });

const client =  new ApolloClient({
    link
});

function withApollo(Component) {

    return (
        <>
            <ApolloProvider client={client}>
                <Component />
            </ApolloProvider>
        </>
    );
}

export default withApollo;