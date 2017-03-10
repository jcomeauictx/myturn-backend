const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is online.',
  });
});

router.use('/groups', require('./group/groupRoutes'));

module.exports = router;
