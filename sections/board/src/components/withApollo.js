import React from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

const client = new ApolloClient({
    uri: `${window.location.origin}/api/graphql`
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