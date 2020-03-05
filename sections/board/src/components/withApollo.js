import React from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

const windowGlobal = typeof window !== 'undefined' && window

const client = new ApolloClient({
    uri: `${windowGlobal.location.origin}/api/graphql`
});

function withApollo(Component) {
    console.log(Component);
    return (
        <>
            <ApolloProvider client={client}>
                <Component />
            </ApolloProvider>
        </>
    );
}

export default withApollo;