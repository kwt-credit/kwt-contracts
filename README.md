# Korean Won Token

This is a project to issue ERC20-based KWT (Korean Won Token).
Ownable, Pausable, Mintable, Burnable and UUPS Proxy features are included.

## Deployed Contracts

|                 | Proxy Address                              | Implementation Address                     |
| --------------- | ------------------------------------------ | ------------------------------------------ |
| Polygon Mainnet | 0x435001Af7fC65B621B0043df99810B2f30860c5d | 0x59e17bf8eecbaab7db37e8fab1d68ecaeb39f3d1 |
| Polygon Testnet | 0x8Ec17bf427556c3972540aAc01adb6367E32d5D3 | 0x4d92c007eaeb31bc88dcbb2e034d80caf901157f |
| BSC Mainnet     | 0xb455c70beb080ab536657d62402ee7463b9de497 |                                            |

## Pre Required

* Nodejs 20+

### Install node_modules

you must first install node_modules.

```
yarn install
```

## Test
Unittest allows you to test your contract's functionality before deploying it to the live network.

### Unittest
You can verify that your ERC20 token is functioning properly.

```
yarn test
```

if you want to get `gas report`, set `REPORT_GAS=true` environment.

```
REPORT_GAS=true yarn test
```

### Coverage

Coverage lets you see statistics on the tested parts of your SmartContract.

```
yarn coverage
```

## Deploy Contract

There are a few steps to deploying a contract.
You can follow these steps to deploy

You can deploy to three networks: `polygon mainnet`, `polygon testnet`, and `hardhat node`.

### Environment

Record the required information in the `.env` file.
You can copy and use the `.env.example` file.

**.env**

```
POLYGON_RPC_URL=
AMOY_RPC_URL=
PRIVATE_KEY=
PROXY_ADDRESS=
ETHERSCAN_API_KEY=
```

* `POLYGON_RPC_URL`: The endpoint address to deploy to Polygon Mainnet
* `AMOY_RPC_URL`: The endpoint address to deploy to Polygon Testnet
* `PRIVATE_KEY`: The private key to deploy the smart contract with. The address that uses this private key will be the first owner of the token.
* `ETHERSCAN_API_KEY`: Create an API Key after registering at [https://polygonscan.com](https://polygonscan.com).

### Compile

Compile the smart contract into bytecode.

```
yarn compile
# or
yarn build
```

### Deploy

Deploy to the desired network.

* Hardhat Node (Local)
  ```
  yarn deploy:local
  ```

* Polygon Testnet (Amoy)

  ```
  yarn deploy:testnet
  ```

* Polygon Mainnet (MATIC)

  ```
  yarn deploy:mainnet
  ```

### Verify

By registering the contract's code with Explorer, Verify gives it credibility with users.

It can be found at [https://polygonscan.com](https://polygonscan.com) and [https://amoy.polygonscan.com](https://amoy.polygonscan.com) and requires an API Key.

For `<contract_address>`, use the address you remembered from the deployment.

* Polygon Testnet (Amoy)

	```
	yarn verify:testnet <proxy_address> --force
	```

	Open https://amoy.polygonscan.com/token/`<contract_address>`

* Polygon Mainnet (MATIC)

	```
	yarn verify:mainnet <proxy_address> --force
	```

	Open https://polygonscan.com/token/`<contract_address>`

### Upgrade

Check `PROXY_ADDRESS` is right in package.json.
Upgrade implementation contract address in proxy contract.

* Hardhat Node (Local)
  ```
  yarn upgrade:local
  ```

* Polygon Testnet (Amoy)

  ```
  yarn upgrade:testnet
  ```

* Polygon Mainnet (MATIC)

  ```
  yarn upgrade:mainnet
  ```
