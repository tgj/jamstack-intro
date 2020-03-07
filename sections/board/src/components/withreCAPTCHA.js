import React from 'react';
import {
    GoogleReCaptchaProvider,
    useGoogleReCaptcha
} from 'react-google-recaptcha-v3';

function WithreCAPTCHA(WrappedComponent, props) {

    const { executeRecaptcha } = useGoogleReCaptcha();
    // const token = executeRecaptcha(props.action);

    return (
        <GoogleReCaptchaProvider 
            reCaptchaKey="6LdNgN8UAAAAANhDlaf09EQLyBbzoJjNW4M1O4S7">
            {<WrappedComponent />}
        </GoogleReCaptchaProvider> 
    );
};

export default WithreCAPTCHA;