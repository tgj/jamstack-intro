import React from 'react';
import '../global.css';
import withApollo from '../components/withApollo';
import Form from '../components/form';
import withreCAPTCHA from '../components/withreCAPTCHA';


const App = () => {
    const action = 'message-board-submit';
    const formWithReCaptcha = withreCAPTCHA(Form, {
        action
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