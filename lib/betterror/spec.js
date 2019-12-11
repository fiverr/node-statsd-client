const betterror = require('.');

describe('betterror', () => {
  it('Should return the original error', () => {
    const error = new Error('Something must have gone terribly wrong');
    expect(betterror(error)).to.equal(error);
  });
  it('Should not a "details" field when not applicable', () => {
    const error = betterror(new Error('Something must have gone terribly wrong'));
    expect(error).to.not.have.keys(['details']);
  });
  it('Should add a "details" field when applicable', () => {
    const error = betterror(new Error('Something must have gone terribly wrong'), { a: 1 });
    expect(error).to.have.keys(['details']);
  });
  it('Should add "details" to error', () => {
    const error = betterror(new Error('Something must have gone terribly wrong'), { a: 1 });
    expect(error.details).to.deep.equal({ a: 1 });
  });
  it('Should assign details if there is are some already', () => {
    const err = new Error('Something must have gone terribly wrong');
    err.details = { a: 1 };
    const error = betterror(err, { b: 2 });
    expect(error.details).to.deep.equal({ a: 1,  b: 2  });
  });
});
