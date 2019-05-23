const Cars = artifacts.require('Cars');

const BN = web3.utils.BN;

contract('Cars - data storage', (accounts) => {

  it('Initialised with zero cars', async () => {
    const instance = await Cars.deployed();

    const initialNumCars =
        await instance.numCars.call()

    assert.equal(initialNumCars.toString(), '0');
  });

});