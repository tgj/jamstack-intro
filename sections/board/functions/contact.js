require('dotenv').config();

exports.handler = (event, _context, callback) => {
    console.log(event);
    const mailgun = require('mailgun-js');
    
    const mg = mailgun({
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN
    });

    const data = JSON.parse(event.body);

    const email = {
        from: `${data.name} <${data.email}>`,
        to: `Tyler Johnston <tyler@tgjohns.io>`,
        subject: 'syt-message-boards',
        text: data.message
    };

    mg.messages().send(email, (error, response) => {
        if (error) {
            callback(error, {
                statusCode: 502,
                body: JSON.stringify(response)
            });
        }
        
        callback(null, {
            statusCode: 200,
            body: JSON.stringify(response)
        });
    });
};