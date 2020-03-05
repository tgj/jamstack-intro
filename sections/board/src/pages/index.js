import React from 'react';
import '../global.css';
import withApollo from '../components/withApollo';
import Form from '../components/form';


const app = () => (
    <>
        <h1>syt-message-boards - WEB</h1>
        <Form />
    </>
);

const appWithApollo = withApollo(app);

export default () => (
    <>
        { appWithApollo }
    </>
);