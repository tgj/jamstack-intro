import React from 'react';
import '../global.css';
import withApollo from '../components/withApollo';
import Form from '../components/form';
import withreCAPTCHA from '../components/withreCAPTCHA';

const App = () => {
    const formWithReCaptcha = withreCAPTCHA(Form, {
        action: 'message-board',
    });
    
    return (
        <>
            <h1>syt-message-boards - WEB</h1>
            { formWithReCaptcha }
        </>
    )
};

const AppWithApollo = withApollo(App);

export default () => (
    <>
        { AppWithApollo }
    </>
);