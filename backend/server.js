const app = require('./app');
const dotenv = require('dotenv');
const { connect } = require('http2');
const path = require('path');
const connectDataBase = require('./config/database');

dotenv.config({path:path.join(__dirname,"config/config.env")});

connectDataBase();

const server = app.listen(process.env.PORT, ()=>{
    console.log(`My Server listening to the port : ${process.env.PORT} in ${process.env.NODE_ENV}`)
});

process.on('unhandledRejection', (err)=>{
    console.log(`Error : ${err.message}`);
    console.log(`Shutting down  the server due to unhandled rejection`);
    server.close(()=>{
        process.exit(1);
    })
})

process.on('uncaughtException', (err)=>{
    console.log(`Error : ${err.message}`);
    console.log(`Shutting down  the server due to unhandled rejection`);
    server.close(()=>{
        process.exit(1);
    })
})

// console.log(a);

