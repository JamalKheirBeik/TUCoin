App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  accountBalance: 0,
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,

  init: () => {
    console.log("App initialized 🔥 🔥");
    // check if metamask is connected
    ethereum.isConnected()
      ? console.log("MetaMask connected 😃😃 ")
      : alert("Please Connect MetaMask And Reload The Page");
    return App.initWeb3();
  },
  initWeb3: () => {
    if (typeof web3 !== "undefined") {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = window.ethereum;
      web3 = new Web3(window.ethereum);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
      web3 = new Web3(App.web3Provider);
    }

    return App.initContracts();
  },
  initContracts: async () => {
    // get response function from Sale.json using the fetch API
    let saleUrl = "Sale.json";
    let saleReq = await fetch(saleUrl);
    let saleRes = await saleReq.json(); // token sale to json

    // add token sale truffle contract to the app
    App.contracts.Sale = TruffleContract(saleRes);
    App.contracts.Sale.setProvider(App.web3Provider);
    // get response function from Token.json using the fetch API
    let tokenUrl = "Token.json";
    let tokenReq = await fetch(tokenUrl);
    let tokenRes = await tokenReq.json(); // token to json
    // add token truffle contract to the app
    App.contracts.Token = TruffleContract(tokenRes);
    App.contracts.Token.setProvider(App.web3Provider);

    App.listenForEvents();

    return App.render();
  },
  // listen for events emmitted from the contract
  listenForEvents: async () => {
    let saleInstance = await App.contracts.Sale.deployed();
    // watch the sell event (the empty object is a filter param)
    let saleEvent = saleInstance.Sell(
      {},
      {
        fromBlock: 0,
        toBlock: "latest",
      }
    );
    saleEvent.watch((error, event) => {
      console.log("event triggered: ", event);
      App.render();
    });
  },
  render: async () => {
    // handle the double loading bug
    if (App.loading) {
      return;
    }
    App.loading = true;

    // hide the content and show loader when loading the data
    hideContent();

    // ! START OF LOADING THE DATA
    // loading the account address
    let notice = document.getElementById("metamask-notice");
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        App.account = accounts[0];
        // assert the public key to the DOM
        let publicKey = document.getElementById("publicKey");
        publicKey.innerHTML = App.account;
        // remove notice when connected
        notice.style.display = "none";
      } catch (error) {
        console.log(error);
        // show notice when having error connecting
        notice.style.display = "block";
      }
    }

    // instances
    let tokenInstance = await App.contracts.Token.deployed();
    let saleInstance = await App.contracts.Sale.deployed();

    // assert balance to the DOM
    let balanceHolder = document.getElementById("balance");
    let balance = await tokenInstance.balanceOf(App.account);
    App.accountBalance = balance.toNumber();
    balanceHolder.innerHTML = App.accountBalance;

    // loading the token sale price
    let price = await saleInstance.tokenPrice();
    App.tokenPrice = price.toNumber();
    // assert the token price in ether to the DOM
    let priceInEther = web3.fromWei(App.tokenPrice, "ether");
    let priceHolder = document.getElementById("price");
    priceHolder.innerHTML = priceInEther;

    // loading the number of sold tokens
    let tokensSold = await saleInstance.tokensSold();
    App.tokensSold = tokensSold.toNumber();
    // assert sold tokens to the DOM
    let soldHolder = document.getElementById("sold");
    soldHolder.innerHTML = App.tokensSold;

    // assert remaining tokens to the DOM
    let remainingHolder = document.getElementById("remaining");
    remainingHolder.innerHTML = App.tokensAvailable - App.tokensSold;
    // ! END OF LOADING DATA

    // show the content and hide the loader when finished loading the data
    App.loading = false;
    showContent();
  },
  buyTokens: async () => {
    // show loader and hide content
    hideContent();
    let numberOfTokens = document.getElementById("numberOfTokens").value;
    let saleInstance = await App.contracts.Sale.deployed();
    let result = saleInstance.buyTokens(numberOfTokens, {
      from: App.account,
      value: numberOfTokens * App.tokenPrice,
      gas: 500000, // gas limit
    });
    // show content
    showContent();
    // reset the form
    document.getElementById("buy-form").reset();
  },
};
// initialize the app on page load
window.addEventListener("load", () => {
  App.init();
});
// handle metamask account change
window.ethereum.on("accountsChanged", (account) => {
  // set the app account to the new account and (reload the page) or (re render the app)
  App.account = account[0];
  // location.reload();
  App.render();
});
// function to hide the content and show the loader
function hideContent() {
  let loader = document.querySelector(".loading");
  let account = document.querySelector(".account");
  let info = document.querySelector(".info");
  let buyForm = document.querySelector(".buy form");

  account.style.display = "none";
  info.style.display = "none";
  buyForm.style.display = "none";
  loader.style.display = "flex";
}
// function to hide the loader and show the content
function showContent() {
  let loader = document.querySelector(".loading");
  let account = document.querySelector(".account");
  let info = document.querySelector(".info");
  let buyForm = document.querySelector(".buy form");

  loader.style.display = "none";
  account.style.display = "block";
  info.style.display = "flex";
  buyForm.style.display = "flex";
}
