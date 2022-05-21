#Navstar Extensions - GMTransport

Navstar extensions is a tool that sends event related data to the SOAP GMTransport service.

## Installation

Just clone the repo. Add the following to a **.env** and execute init.sh
Make sure to have a recent version of node. Node version tested: v18.1.0
```bash
git clone https://github.com:vedjap/navstar-ext-gm.git
cd navstar_ext
./init.sh
```

## Usage
Can be configured in the init.sh script. Options can be added to the script. Check [Log-rotate](https://www.npmjs.com/package/pm2-logrotate) and [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/) for more info.


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
