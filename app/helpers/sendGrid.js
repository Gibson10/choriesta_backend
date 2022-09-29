const client = require('@sendgrid/client');
require("dotenv").config()
// Add contact to Sendgrid
const addContact = async (emailAddress, firstName, lastName, username) => {

    client.setApiKey(process.env.SENDGRID_API_KEY); 

    const data = {
        "contacts": [
          {
            'email': emailAddress,
            'first_name': firstName,
            'last_name': lastName,
            'unique_name': username
          }
        ]
      };

    const request = {
        method: 'PUT',
        url: '/v3/marketing/contacts',
        body: data
    };

    client.request(request)
    .then(() => {
        // Do nothing
    })
    .catch(error => {
        // Do nothing
    });
}

// Send transactional email template via Sendgrid
const mailer = async (emailAddress, code,) => {

    client.setApiKey(process.env.SENDGRID_API_KEY);

          const  data = {
                'personalizations': [
                    {
                    'to': [
                        {
                        'email': emailAddress,
                        }
                    ],
                    'dynamic_template_data': {
                        name: `${emailAddress}`,
                        code: code
                    },
                    }
                ],
                'from': {
                    'email': process.env.FROM_EMAIL,
                    'name': 'Choreista Team'
                },
                'reply_to': {
                    'email': process.env.FROM_EMAIL,
                    'name': 'Choreista Team'
                },
                'template_id': process.env.WELCOME_TEMPLATE
            }
    
    

    const request = {
        method: 'POST',
        url: '/v3/mail/send',
        body: data
    };

    await client.request(request)
        .then((data) => {
            // Do nothing
        })
        .catch(error => {
            // Do nothing
            console.log("error",error)
        });
}

module.exports = {
    mailer,
    addContact
}
