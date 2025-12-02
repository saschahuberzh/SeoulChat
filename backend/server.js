const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const logger = require('./src/middleware/logger');
const errorHandler = require('./src/middleware/errorHandler');
const routes = require('./src/routes');
const { swaggerUi, specs } = require('./src/docs/swagger');
const { initSocket } = require('./src/socket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

const io = initSocket(server);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger);

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(routes);

app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
