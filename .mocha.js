const chai = require('chai');
chai.use(require('chai-string'));
const wait = require('@lets/wait');

Object.assign(
	global,
	chai,
	{
		wait,
	}
);

process.on('unhandledRejection', error => { throw error; });
