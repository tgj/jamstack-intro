import React, { useReducer } from 'react';
import styles from './form.module.css';
import { useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

const ADD_MESSAGE = gql`
  mutation AddMessage($message: AddMessageInput!) {
    addMessage(message: $message) {
        writtenBy
        email
        content
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
    const error = errorResponse.graphQLErrors[0];
    if (error && error.extensions) {
        return Object.values(error.extensions.validationErrors);
    }
    return [ JSON.stringify(errorResponse) ];
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

const Form = () => {
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
    const [addMessage, { data}] =  useMutation(ADD_MESSAGE);

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

    const handleSubmit = event => {
        event.preventDefault();
      
        setStatus('PENDING');

        addMessage({ variables: { 
            message: {
                content: state.message,
                writtenBy: state.name,
                email: state.email
            }
        }})
        .then(() => {
            fetch('/api/contact', {
                method: 'POST',
                body: JSON.stringify(state)
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
                console.log(response);
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
                        state.errors.map(error => (
                            <li>{ error }</li>
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
                <button className={`${styles.button} ${styles.centered}`}>Send</button>
            </form>
        </>
    )
};

export default Form;