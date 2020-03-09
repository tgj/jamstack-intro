import React, { useReducer } from 'react';
import styles from './form.module.css';
import { useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import {
    useGoogleReCaptcha
} from 'react-google-recaptcha-v3';

const ADD_MESSAGE = gql`
  mutation AddMessage($message: AddMessageInput!) {
    addMessage(message: $message) {
        code
    }
  }
`;

const INITIAL_STATE = {
    name: '',
    errors: [],
    message: '',
    email: '',
    topic: 'Tech Talk Ideas',
    status: 'IDLE'
};

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

const reducer = (state, action) => {
    switch (action.type) {
        case 'updateFieldValue':
            return {
                ...state, 
                [action.field]: action.value
            };
        case 'updateStatus':
            if (action.status === 'ERROR') {
                return {
                    ...state,
                    errors: action.errors,
                    status: action.status
                }
            }
            return {
                ...state,
                errors: [],
                status: action.status
            };
        case 'reset':
            return INITIAL_STATE;
        default:
            return INITIAL_STATE;
    }
};

const Form = props => {
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
    const [addMessage] =  useMutation(ADD_MESSAGE);

    const updateFieldValue = field => event => {
        dispatch({
            type: 'updateFieldValue',
            field,
            value: event.target.value
        });
    };

    const setStatus = status => dispatch({
        type: 'updateStatus',
        status
    });

    const { executeRecaptcha } = useGoogleReCaptcha();

    const reCaptchaHandler = async action => {

        if (!executeRecaptcha) {
            return;
        }
      
        const token = await executeRecaptcha(action);

        const result = await fetch('/api/reCAPTCHA', {
            method: 'POST',
            body: JSON.stringify({
                token
            })
        })
        .then(response => {
            if (!response.ok) {
                return Promise.reject(response)
            }
            return response.json();
        })
        .catch(async response => {
            const error = await response.text().then(text => text);
            return Promise.reject(error);
        })
        .then(response => response)
        .catch(error => {
            console.error(error);
        });

        return result;
    };

    const handleSubmit = async event => {
        event.preventDefault();

        if (props.reCAPTCHA) {
            const reCAPTCHAVerificationResult = await reCaptchaHandler('addMessage');
            if (reCAPTCHAVerificationResult === false) {
                dispatch({
                    type: 'updateStatus',
                    status: 'ERROR',
                    errors: ["Unable to perform this action"]
                });
                return;
            };
        }
      
        setStatus('PENDING');

        addMessage({ variables: { 
            message: {
                content: state.message,
                writtenBy: state.name,
                email: state.email
            }
        }})
        .then(addMessageData => {
            const approvalCode = addMessageData.data.addMessage.code;
            fetch('/api/contact', {
                method: 'POST',
                body: JSON.stringify({
                    ...state,
                    message: `
Hi there, you've received a new message:

----- START OF MESSAGE -----

${state.message}

----- END OF MESSAGE -----

Approve message: ${window.location.origin}/messageApprovals?code=${approvalCode}
`
                })
            })
            .then(response => {
                if (!response.ok) {
                    return Promise.reject(response);
                }
                return response.json();
            })
            .catch(async response => {
                const error = await response.text().then(text => text);
                return Promise.reject(error);
            })
            .then(response => {
                dispatch({
                    type: 'reset'
                });
                setStatus('SUCCESS');
            })
            .catch(error => {
                dispatch({
                    type: 'updateStatus',
                    status: 'ERROR',
                    errors: [JSON.stringify(error)]
                })
            });
        })
        .catch (error => {
            const errors = extractGraphQlErrors(error)
            dispatch({
                type: 'updateStatus',
                status: 'ERROR',
                errors
            })
        });
    };

    let errorWell;

    if (state.status === 'ERROR') {
        if (state.errors.length === 1) {
            errorWell = 
            <>
                <p className={styles.error}>{ state.errors[0]}</p>
            </>
        } else {
            errorWell = 
            <>
                <ul className={styles.error} style={{listStyle: 'none'}}>
                    {
                        state.errors.map((error, i) => (
                            <li key={i}>{ error }</li>
                        ))
                    }
                </ul>
            </>
        }
    }

    return (
        <>

            {state.status === 'SUCCESS' && (
                <p className={styles.success}>
                    Message sent!
                </p>
            )}

            {state.status === 'ERROR' && errorWell}


            <form className={`${styles.form} ${state.status === 'PENDING' && styles.pending}`} onSubmit={handleSubmit}>
                <h4 className={styles.centered}>Topic: {state.topic}</h4>
                <label className={styles.label}>
                    Name
                    <input 
                        className={styles.input}
                        type="text"
                        name="name"
                        value={state.name}
                        onChange={updateFieldValue('name')}
                    />
                </label>
                <label className={styles.label}>
                    Email
                    <input
                        className={styles.input}
                        type="email"
                        name="email"
                        value={state.email}
                        onChange={updateFieldValue('email')} 
                    />
                </label>
                <label className={styles.label}>
                    Message
                    <textarea
                        className={styles.input}
                        name="message" 
                        value={state.message}
                        onChange={updateFieldValue('message')} 
                    />
                </label>
                <label className={styles.hidden}>
                    BotName
                    <input 
                        className={styles.input}
                        type="text"
                        name="name"
                        value={state.name}
                        onChange={updateFieldValue('name')}
                    />
                </label>
                <button className={`${styles.button} ${styles.centered} ${styles.fullwidth}`}>Send</button>
            </form>
        </>
    )
};

export default Form;