import React, { useReducer } from 'react';
import '../global.css';
import withApollo from '../components/withApollo';
import { useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

const APPROVAL_MESSAGE = gql`
    mutation ApproveMessage($input: ApproveMessageInput!) {
        approveMessage(input: $input) {
            approvalDate
        }
    }
`;

const INITIAL_STATE = {
    status: 'IDLE'
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'updateStatus':
            return {
                ...state,
                status: action.status
            };
        default:
            return INITIAL_STATE;
    }
};

const MessageApprovals = () => {
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

    /*const url = window.location;
    const urlObject = new URL(url);
    const code = urlObject.searchParams.get('code');*/

    return (
        <>
            <h1>Message Approval</h1>
            {state.status === 'SUCCESS' && (
                <p>
                    Message approved!
                </p>
            )}
        </>
    )
};

const MessageApprovalsWithApollo = withApollo(MessageApprovals);

export default () => (
    <>
        { MessageApprovalsWithApollo }
    </>
);