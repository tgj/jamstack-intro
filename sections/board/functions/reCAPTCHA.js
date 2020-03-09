require('dotenv').config();
require('isomorphic-fetch');

exports.handler = (event, _context, callback) => {
    const data = JSON.parse(event.body);

    const reCAPTCHAVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${data.token}`;

    fetch(reCAPTCHAVerifyUrl, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            return Promise.reject(response);
        }
        return response.json();
    })
    .then(response => {
        const allow = response.success;
        callback(null, {
            statusCode: 200,
            body: JSON.stringify(response)
        });
    })
    .catch(error => {
        if (error) {
            callback(error, {
                statusCode: 502,
                body: JSON.stringify(error)
            });
        }
    });
};