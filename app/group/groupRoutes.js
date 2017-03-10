const express = require('express');
const controller = require('./groupController');

const router = express.Router();

router.route('/')
  .get(controller.get)
  .post(controller.post);

router.route('/:id')
  .get(controller.getOneById);

router.put('/:id/join', controller.joinGroup);

module.exports = router;
