const swaggerdoc = require('swagger-jsdoc');

const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Multi-API designed for BotGhost',
        "description" : "This API is designed to perform a variety of functions in order to assist users in creating or enhancing their commands and events in BotGhost.\n\nIt is possible to use the API outside of BotGhost, although some endpoints may not function correctly.\n\n\nI can be contacted via Discord: `@therealdax`",
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'Discord Bot Token',
            valuePrefix: 'Bot '
          },
        },
      },
    },
    apis: ['./endpoints/*.js'],
  };
  
  const specs = swaggerdoc(options);

  module.exports = specs;

  