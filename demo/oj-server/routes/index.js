const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', function(req, resp){
    resp.sendFile('index.html', { root: path.join(__dirname, '../../public/') });
});
module.exports = router;