import React, { useEffect, useReducer } from 'react';
import '../global.css';
import styles from './ma.module.css';
import withApollo from '../components/withApollo';
import { useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import { extractGraphQlErrors } from '../lib/util';

const APPROVE_MESSAGE = gql`
    mutation ApproveMessage($input: MessageApprovalInput!) {
        approveMessage(input: $input) {
            approved
        }
    }
`;

const INITIAL_STATE = {
    status: 'PENDING'
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
    const [approveMessage, { data }] =  useMutation(APPROVE_MESSAGE);

    const setStatus = status => dispatch({
        type: 'updateStatus',
        status
    });

    useEffect(() => {
        const url = window.location;
        const urlObject = new URL(url);
        const code = urlObject.searchParams.get('code');
        if (code) {
            async function approve() {
                await approveMessage({ variables: { 
                    input: {
                        approvalId: code,
                    }
                }})
                .then(response => {
                    console.log(response);
                    const approved = response.data.approveMessage.approved;
                    if (approved) {
                        setStatus('APPROVED');
                    } else {
                        setStatus('REJECT');
                    }
                })
                .catch (error => {
                    const errors = extractGraphQlErrors(error)
                    dispatch({
                        type: 'updateStatus',
                        status: 'ERROR',
                        errors
                    })
                });
            }
            approve();
        }
    }, [approveMessage]);

    return (
        <>
        <div>
            <h1>Message Approval</h1>
            <p className={styles.centered}>
                   {state.status === 'PENDING' &&
                       'Approving Message...'
                   }
                    {state.status === 'APPROVED' &&
                       'Message Approved! ✅'
                   }
                    {state.status === 'REJECT' &&
                       'Message Not Approved! ⚠️'
                   }
            </p>
            {
                (state.status === 'APPROVED' || state.status === 'REJECT') && (
                    <p className={`${styles.centered} ${styles.closeMessage}`}>
                        You may close this browser window.
                    </p>
                )
            }
        </div>
        </>
    )
};

const MessageApprovalsWithApollo = withApollo(MessageApprovals);

export default () => (
    <>
        { MessageApprovalsWithApollo }
    </>
);