const axios = require('axios');

const genTally = async (req, res) => {
    let event = req.body;

    switch (event.eventType) {
        case 'FORM_RESPONSE':
          const name = event.data.formName;
          const user = event.data.fields[0].value;
          const fields = event.data.fields.filter(field => field.type === "HIDDEN_FIELDS").map(field => field.label);

          console.log('Event Received.');

          const header = {
            Authorization: fields[0],
            'Content-Type': 'application/json',
          };

          const reqBody = {
            variables: [{
              name: 'Form Name',
              variable: '{tally_form_name}',
              value: `${name}`
            },
            {
              name: 'User ID',
              variable: '{tally_user_id}',
              value: `${user}`
            }]};

          axios.post(fields[1], reqBody, { headers: header })
          .then(response => {
            console.log('Successful');
          })
          .catch(error => {
            console.error('Error', error);
          })

          break;
        default:
          // Unexpected event type
          console.log(`Unhandled event type ${event.type}.`);
      }

    res.status(200).send('');
}

module.exports = genTally;

