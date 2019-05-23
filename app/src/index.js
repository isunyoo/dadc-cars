import Web3 from 'web3';
import { toWei } from 'web3-utils';

console.log('Hello World!!!');

import carsArtefact from "../../build/contracts/Cars.json";

const CarsApp = {
    web3: undefined,
    accounts: undefined,
    contract: undefined,
  };

  window.addEventListener('load', function() {
    if (window.ethereum) {
        console.log('web3 provider detected');
        init();
    } else {
      // basically, politely telling the user to install a newer version of
      // metamask, or else fly 🪁
      console.error('No compatible web3 provider injected');
    }
  });

  async function init() {
    try {
      window.CarsApp = CarsApp; // DEBUG
      await window.ethereum.enable(); // get permission to access accounts
      CarsApp.web3 = new Web3(window.ethereum);
  
        // determine network to connect to
        let networkId = await CarsApp.web3.eth.net.getId();
        console.log('networkId', networkId);

        let deployedNetwork = carsArtefact.networks[networkId];
        if (!deployedNetwork) {
        console.warn('web3 provider is connected to a network ID that does not matched the deployed network ID');
        console.warn('Pls make sure that you are connected to the right network, defaulting to deployed network ID');
        networkId = Object.keys(carsArtefact.networks)[0];
        deployedNetwork = carsArtefact.networks[networkId];
        }
        console.log('deployedNetwork', deployedNetwork);
    
        // initialise the contract
        CarsApp.contract = new CarsApp.web3.eth.Contract(
            carsArtefact.abi,
            deployedNetwork.address,
        );
  
      // set the initial accounts
      updateAccounts(await CarsApp.web3.eth.getAccounts());
        
      console.log('CarsApp initialised');
    } catch (err) {
      console.error('Failed to init contract');
      console.error(err);
    }
  
    // trigger various things that need to happen upon app being opened.    
    await queryNumCars();
    window.ethereum.on('accountsChanged', updateAccounts);

    // set up listeners for app interactions.
    const queryNumCarsButton = document.querySelector('#queryNumCarsButton');
    queryNumCarsButton.addEventListener('click', queryNumCars);
     
    const queryCarByIdButton = document.querySelector('#queryCarByIdButton');
    queryCarByIdButton.addEventListener('click', queryCarById);

    const addCarButton = document.querySelector('#addCarButton');
    addCarButton.addEventListener('click', addCar);

    const honkCarButton = document.querySelector('#honkCarButton');
    honkCarButton.addEventListener('click', honkCar);

  }

  async function updateAccounts(accounts) {
    CarsApp.accounts = accounts;
    console.log('updateAccounts', accounts[0]);
  }

  async function queryNumCars() {
    console.log('Query Num Cars');
    const numCars = await CarsApp.contract.methods.numCars().call({
      from: CarsApp.accounts[0],
    });
    console.log(numCars);
    document.querySelector('#numCarsOutput').value = numCars.toString();
  }

  async function queryCarById() {
    console.log('Query Car by ID');
    const carIdInput = document.querySelector('#carIdInput');
  
    const car = await CarsApp.contract.methods.cars(carIdInput.value).call({
      from: CarsApp.accounts[0],
    });
    console.log(car);
    const {
      colour,
      doors,
      owner,
    } = car;
    const parsedCar = {
      colour,
      doors,
      owner,
    };
    document.querySelector('#carOutput').value = JSON.stringify(parsedCar, undefined, 2);
  }

  async function addCar() {
    console.log('Sending TX addCar');
    const colourInput = document.querySelector('#colourInput');
    const doorsInput = document.querySelector('#doorsInput');
  
    await CarsApp.contract.methods.addCar(
      colourInput.value, // '0xff00ff', // colour: purple
      doorsInput.value, // 4, // doors: 4
      0, // distance: 0
      0, // lat: 0
      0, // lon: 0
      // NOTE cannot use BN here, because of bug in web3.js, see:
      // https://github.com/ethereum/web3.js/issues/2077
    ).send({
      from: CarsApp.accounts[0],
      value: toWei('0.11', 'ether'),
    });
  
    console.log('car added');
  
    await queryNumCars();
  }

  async function honkCar() {
    console.log('Sending TX honkCar');
    const fromCarInput = document.querySelector('#fromCarInput');
    const atCarInput = document.querySelector('#atCarInput');
  
    const fromCar = +(fromCarInput.value);
    const atCar = +(atCarInput.value);
  

    const estimatedGas = await CarsApp.contract.methods.honkCar(
      fromCar,
      atCar,
    ).estimateGas({
      from: CarsApp.accounts[0],
    });
  
    await CarsApp.contract.methods.honkCar(
      fromCar,
      atCar,
    ).send({
      gas: Math.floor(estimatedGas * 2),
      from: CarsApp.accounts[0],
    });
    console.log({ estimatedGas });

    await CarsApp.contract.methods.honkCar(
      fromCar,
      atCar,
    ).send({
      from: CarsApp.accounts[0],
    });
  
    console.log('car honked');
  
    await queryNumCars();
  }
