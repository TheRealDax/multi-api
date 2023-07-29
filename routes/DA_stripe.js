const axios = require('axios');
//const stripe = require('stripe')(process.env.STRIPE_KEY); //! Don't need this?
const bgKey = process.env.DA_BG_API_KEY;
const webhookUrl = `https://api.botghost.com/webhook/1123604239608991825/9xs1dn6jjm5mrsipmeukpa`;

const daStripeEvent = async (req, res) => {
	let event = req.body;

	switch (event.type) {
		case 'checkout.session.completed':
			const checkoutSession = event.data.object;
			const fullAmount = checkoutSession.amount_total;
			const formattedAmount = `${fullAmount.toString().slice(0, -2)}.${fullAmount.toString().slice(-2)}`;
			const user = checkoutSession.metadata.userid;
			const email = checkoutSession.customer_details.email;

			console.log(`Checkout Session for ${checkoutSession.amount_total} was successful!`);

			const header = {
				Authorization: bgKey,
				'Content-Type': 'application/json',
			};

			const reqBody = {
				variables: [
					{
						name: 'Amount',
						variable: '{checkout.amount}',
						value: `${formattedAmount}`,
					},
					{
						name: 'UserID',
						variable: '{checkout.userid}',
						value: `${user}`,
					},
					{
						name: 'Email',
						variable: '{checkout.email}',
						value: `${email}`,
					},
				],
			};

			axios
				.post(webhookUrl, reqBody, { headers: header })
				.then((response) => {
					console.log('Successful', formattedAmount, user);
				})
				.catch((error) => {
					console.error('Error', error);
				});

			break;
		default:
			// Unexpected event type
			console.log(`Unhandled event type ${event.type}.`);
	}

	// Return a 200 response to acknowledge receipt of the event
	res.status(200).send('');
};

module.exports = daStripeEvent;
