import React, { useReducer } from 'react';
import styles from './form.module.css';

const INITIAL_STATE = {
    name: '',
    email: '',
    subject: '',
    body: '',
    status: 'IDLE'
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'updateFieldValue':
            return {
                ...state, 
                [action.field]: action.value
            };
        case 'updateStatus':
            return {
                ...state,
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

        fetch('/api/contact', {
            method: 'POST',
            body: JSON.stringify(state)
        })
        .then(response => {
            if (!response.ok) {
                return Promise.reject(response.json())
            }
            return response.json();
        })
        .then(response => {
            console.log(response);
            dispatch({
                type: 'reset'
            });
            setStatus('SUCCESS');
        })
        .catch(error => {
            console.error('Error:', error);
            setStatus('ERROR');
        });
    };

    return (
        <>

            {state.status === 'SUCCESS' && (
                <p className={styles.success}>
                    Message sent!
                </p>
            )}

            {state.status === 'ERROR' && (
                <p className={styles.error}>Something went wrong. Please try again.</p>
            )}

            <form className={`${styles.form} ${state.status === 'PENDING' && styles.pending}`} onSubmit={handleSubmit}>
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
                    Subject
                    <input 
                        className={styles.input}
                        type="text"
                        name="subject"
                        value={state.subject}
                        onChange={updateFieldValue('subject')} 
                    />
                </label>
                <label className={styles.label}>
                    Body
                    <textarea
                        className={styles.input}
                        name="body" 
                        value={state.body}
                        onChange={updateFieldValue('body')} 
                    />
                </label>
                <button className={styles.button}>Send</button>
            </form>
        </>
    )
};

export default Form;