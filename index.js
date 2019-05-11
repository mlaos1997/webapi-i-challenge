const express = require('express');
const cors = require('cors');
const db = require('./data/db.js');

const port = 5000;
const server = express();

server.use(express.json()); // This middleware is used to parse data coming in
server.use(cors({origin: 'http://localhost:3000'})); //cors is used to enable communication from other ports/URLs

const sendUserError = (status, message, res) => {
    res
        .status(status)
        .json({errorMessage: message});
};

server.post('/api/users', (req, res) => {
    const {name, bio} = req.body;
    if (!name || !bio) {
        sendUserError(400, 'Please provide name and bio for the user.', res);
        return;
    }
    db
        .insert({name, bio})
        .then(response => {
            res
                .status(201)
                .json(response);
        })
        .catch(error => {
            console.log(error);
            sendUserError(400, error, res);
        });
});

server.get('/api/users', (req, res) => {
    db
        .find()
        .then(users => {
            res.json({users});
        })
        .catch(error => {
            sendUserError(500, 'The users information could not be retrieved.', res);
            return;
        });
});

server.get('/api/users/:id', (req, res) => {
    const {id} = req.params;
    db
        .findById(id)
        .then(user => {
            if (user.length === 0) {
                sendUserError(400, 'The user with the specified ID does not exist.', res);
                return;
            }
            res.json(user);
        })
        .catch(error => {
            sendUserError(500, 'The user information could not be retrieved.', res);
        });
});

server.delete('/api/users/:id', (req, res) => {
    const {id} = req.params;
    db
        .remove(id)
        .then(response => {
            if (response === 0) {
                sendUserError(404, 'The user with the specified ID does not exist.', res);
                return;
            }
            res.json({success: 'User is gone'})
        })
        .catch(error => {
            sendUserError(500, 'The user could not be removed')
        });
});

server.put('/api/users/:id', (req, res) => {
    const {id} = req.params;
    const {name, bio} = req.body;
    if (!name || !bio) {
        sendUserError(400, 'Please provide name and bio for the user.', res);
        return;
    }
    db
        .update(id, {name, bio})
        .then(response => {
            if (response === 0) {
                sendUserError(404, 'The user with the specified ID does not exist.', res);
                return;
            }
            db
                .findById(id)
                .then(user => {
                    if (user.length === 0) {
                        sendUserError(404, 'The user with the specified ID does not exist.', res);
                        return;
                    }
                    res.json(user);
                })
                .catch(error => {
                    sendUserError(500, 'The user information could not be modified.', res);
                });
        })
});

server.listen(port, () => console.log(`Server running on ${port}`));