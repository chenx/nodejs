const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const problemService = require('../services/problemService');

router.get('/problems', function(req, resp) {
    problemService.getProblems()
        .then(problems => resp.json(problems));
});

router.get('/problems/:id', function(req, resp) {
    const id = req.params.id;
    problemService.getProblem(+id)
        .then(problem => resp.json(problem));
});

router.post('/problems', jsonParser, function(req, resp) {
    problemService.addProblem(req.body)
        .then(problem => {
            resp.json(problem);
        },
        error => {
            resp.status(400).send('Problem name already exists');
        });
});

module.exports = router;

//GET /api/v1/problems
//GET /api/v1/problems/:id
//POST /api/v1/problems
