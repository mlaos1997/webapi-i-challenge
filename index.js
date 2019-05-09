// implement your API here
const express = require('express');
const db = require('./data/db.js');
const server = express();

server.use(express.json());

// endpoints
server.get('/api/users', (req, res) => {
    db
        .find()
        .then(user => res.json({user}))
        .catch(({code, message}) => {
            res
                .status(code)
                .json({err: 'The users information could not be retrieved.'});
        });
});

server.get('/api/:id', (req, res) => {
    const {id} = req.params;
    db
        .findById(id)
        .then(user => {
            if (user) {
                res.json({user});
            } else if (user.length === 0) {
                res
                    .status(404)
                    .json({err: 'The user with the specified ID does not exist.'})
            } else {
                res
                    .status(500)
                    .json({err: 'The user information could not be retrieved.'})
            }
        });
})

server.post('/api/users', (req, res) => {
    const {name, bio} = req.body;

    if (name || bio) {
        db
            .insert({name, bio})
            .then(response => {
                res
                    .status(201)
                    .json(response);
            })
            .catch(({code}) => {
                res
                    .status(code)
                    .json({err: 'Please provide name and bio for user'});
            })
    }
});

server.delete('/api/users/:id', (req, res) => {
    const {id} = req.params;
    db
        .remove(id)
        .then(res => {
            if (res === 0) {
                res
                    .status(404)
                    .json({err: 'The user with the specified ID does not exist.'})
                return;
            } else {
                res.json({message: 'User has been deleted'})
            }
        })
        .catch(err => {
            res
                .status(500)
                .json({error: 'The user could not be removed'});
        });
});

server.put('/api/users/:id', (req, res) => {
    const {id} = req.params;
    const {name, bio} = req.body;
    if (!name || !bio) {
       res.status(400).json({err: 'Please provide name and bio for user'})
        return;
    }
    db
        .update(id, {name, bio})
        .then(res => {
            if (res === 0) {
                res
                    .status(400)
                    .json({err: 'User with specified id does not exist'})
                return;
            }
        })
        .catch(error => {
            res
                .status(500)
                .json({err: 'The user information could not be modified.'})
            return;
        });
});

server.listen(3000, () => {
    console.log('Listening on port 3000');
});