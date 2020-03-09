const extractGraphQlErrors = errorResponse => {
    if (errorResponse.networkError) {
        return [errorResponse.networkError.name];
    }

    const graphQLErrors = errorResponse.graphQLErrors || [];

    if (graphQLErrors.length > 0) {
        const graphQLErrorResponse = graphQLErrors[0];
        if (graphQLErrorResponse.extensions && graphQLErrorResponse.extensions.validationErrors) {
            return Object.values(graphQLErrorResponse.extensions.validationErrors);
        }
    }

    return [errorResponse.message];
};

export {
    extractGraphQlErrors
};