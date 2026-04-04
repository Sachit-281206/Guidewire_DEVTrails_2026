const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const { startMonitoringEngine } = require('./services/triggerService');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/insuregig')
  .then(() => {
    console.log('[Server] MongoDB connected');
    startMonitoringEngine();
  })
  .catch(err => console.error(err));

app.use('/api/users',       require('./routes/users'));
app.use('/api/policies',    require('./routes/policies'));
app.use('/api/shifts',      require('./routes/shifts'));
app.use('/api/disruptions', require('./routes/disruptions'));
app.use('/api',             require('./routes/disruptions'));
app.use('/api/environment', require('./routes/environment'));

app.listen(5000, () => console.log('[Server] Running on port 5000'));
