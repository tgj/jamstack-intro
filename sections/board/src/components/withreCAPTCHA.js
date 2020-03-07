import React from 'react';
import {
    GoogleReCaptchaProvider,
} from 'react-google-recaptcha-v3';

function WithreCAPTCHA(WrappedComponent, props) {

    const updatedProps = {
        ...props,
        reCAPTCHA: {
            action: props.action
        }
    }

    return (
        <GoogleReCaptchaProvider 
            reCaptchaKey="6LdNgN8UAAAAANhDlaf09EQLyBbzoJjNW4M1O4S7">
            <WrappedComponent {...updatedProps}/>
        </GoogleReCaptchaProvider> 
    );
};

export default WithreCAPTCHA;