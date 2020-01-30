const chai = require('chai');
chai.use(require('chai-string'));
const wait = require('@lets/wait');

Object.assign(
    global,
    chai,
    {
        wait
    }
);

setTimeout(() => process.exit(0), 20000);
process.on('unhandledRejection', (error) => { throw error; });
