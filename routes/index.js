const express = require('express');
const router = express.Router();
const user = require('./user');
const post = require('./post');
const comment = require('./comment');
const auth = require('../middlewares/auth');
require('dotenv').config();

//swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  info: {
    title: '',
    version: '1.0.0',
    description: '',
  },
  host: `localhost:${process.env.PORT}`,
  basePath: '/',
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      scheme: 'bearer',
      in: 'header',
      bearerFormat: 'JWT',
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./swagger/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
router.get('./swagger.json', (req, res) => {
  res.setHeader('content-Type', 'application/json');
  res.send(swaggerSpec);
});
router.use('/users', user);
router.use('/posts', post);
router.use('/comments', comment);
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
