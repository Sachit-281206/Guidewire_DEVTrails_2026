const express = require('express');
const router  = express.Router();
const { getEnvironment } = require('../services/environmentService');
const { createOutageProbability, evaluateTriggers, prioritizeTriggers } = require('../services/triggerService');

router.get('/:city', async (req, res) => {
  const env = await getEnvironment(req.params.city);
  const triggers = prioritizeTriggers(
    evaluateTriggers(env, req.params.city, {
      outageProbability: createOutageProbability(req.params.city, 'public', new Date(env.timestamp).getTime()),
    }),
  );

  res.json({ ...env, triggers });
});

module.exports = router;
