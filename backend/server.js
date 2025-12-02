const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const logger = require('./src/middleware/logger');
const errorHandler = require('./src/middleware/errorHandler');
const routes = require('./src/routes');
const { swaggerUi, specs } = require('./src/docs/swagger');

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(logger);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
