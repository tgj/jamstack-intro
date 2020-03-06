import React from 'react';
import '../global.css';
import withApollo from '../components/withApollo';
import { useMutation } from '@apollo/react-hooks';


const MessageApprovals = () => (
    <>
        <h1>Message Approval</h1>
    </>
);

const MessageApprovalsWithApollo = withApollo(MessageApprovals);

export default () => (
    <>
        { MessageApprovalsWithApollo }
    </>
);