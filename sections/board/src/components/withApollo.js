import React from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

const windowGlobal = typeof window !== 'undefined' && window

const client = window.location ? new ApolloClient({
    uri: `${windowGlobal.location.origin}/api/graphql`
}) : undefined;

function withApollo(Component) {
    if (!client) {
        return <Component />
    }
    
    return (
        <>
            <ApolloProvider client={client}>
                <Component />
            </ApolloProvider>
        </>
    );
}

export default withApollo;