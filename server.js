// Purpose: This file is the entry point for the server. 
// It sets up the server and listens on the specified port. It also imports the routes 
// from the routes folder and the sequelize connection from the config folder. 
// It also syncs the sequelize models to the database.

const express = require('express');
const routes = require('./routes');
const db = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

// sync sequelize models to the database, then turn on the server

db.once('open', () => {
    app.listen(PORT, () => {
        console.log(`App listening on port: ${PORT}!`);
    })
});