let problems = [
    {
        "id": 1,
        "name": "Two Sum",
        "desc": "Description",
        "difficulty": "easy"
    },
    {
        "id": 2,
        "name": "3 Sum",
        "desc": "Description",
        "difficultyv": "medium"
    },
    {
        "id": 3,
        "name": "4 Sum",
        "desc": "Description",
        "difficulty": "medium"
    },
    {
        "id": 4,
        "name": "4 Triangle Count",
        "desc": "Description",
        "difficulty": "hard"
    },
    {
        "id": 5,
        "name": "5 Sliding Window Maximum",
        "desc": "Description",
        "difficulty": "super"
    }
];

// const getProblems = function() {
//     return new Promise((resolve, reject) => {
//         resolve(problems);
//     });
// }

// const getProblem = function(id) {
//     return new Promise((resolve, reject) => {
//         resolve(problems.find(problem => problem.id === id));
//     });
// }

// const addProblem = function(newProblem) {
//     return new Promise((resolve, reject) => {
//         if (problems.find(problem => problem.name === newProblem.name)) {
//             reject('problem already exists: ' + newProblem.name);
//         } else {
//             newProblem.id = problems.length + 1;
//             problems.push(newProblem);
//             resolve(newProblem);
//         }
//     });
// }

const ProblemModle = require('../models/problemModel');

const getProblems = function() {
    return new Promise((resolve, reject) => {
        ProblemModle.find({}, (err, problems) => {
            if (err) {
                reject(err);
            } else {
                resolve(problems);
            }
        });
    });
}

const getProblem = function(id) {
    return new Promise((resolve, reject) => {
        ProblemModle.findOne({id: id}, (err, problem) => {
            if (err) {
                reject(err);
            } else {
                resolve(problem);
            }
        });
    });
}

const addProblem = function(newProblem) {
    return new Promise((resolve, reject) => {
        ProblemModle.findOne({name: newProblem.name}, (err, data) => {
            if (data) {
                reject('problem already exists');
            } else {
                ProblemModle.count({}, (err, num) => {
                    newProblem.id = num + 1;
                    const mongooseProblem = new ProblemModle(newProblem);
                    mongooseProblem.save();
                    resolve(mongooseProblem);
                });
            }
        });
    });
}

module.exports = {
    getProblems,
    getProblem,
    addProblem
};