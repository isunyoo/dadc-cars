const Cars = artifacts.require('Cars');

const BN = web3.utils.BN;

contract('Cars - state machines', (accounts) => {

  it('Adds a new car', async () => {
    const instance = await Cars.deployed();

    // perform the state transition
    const tx =    
    await instance.addCar(
      '0xff00ff', // colour: purple
      new BN(4), // doors: 4
      new BN(0), // distance: 0
      new BN(0), // lat: 0
      new BN(0), // lon: 0
      {
        from: accounts[1],
        value: web3.utils.toWei('0.11', 'ether'),
      },
    );

    // retrieve the updated state
    const numCars =
    await instance.numCars.call();
    const car1 =
    await instance.cars.call(new BN(1));

    // perform the assertions
    assert.equal(numCars.toString(), '1');
    assert.equal(car1.colour, '0xff00ff');
    assert.equal(car1.doors.toString(), '4');
    assert.equal(car1.distance.toString(), '0');
    assert.equal(car1.lat.toString(), '0');
    assert.equal(car1.lon.toString(), '0');
    assert.equal(car1.status.toString(), '1'); // parked
    assert.equal(car1.owner, accounts[1]);
    
  });

});