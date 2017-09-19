# postmen

Like postman, but lets you schedule requests in sequence which can depend on each other and reference values of previous requests. 

## Features
- Multiple sequential requests
- Conditional requests
- Referencing past results in requests

## Usage
### First-Time Setup
Clone this repo, `cd` into the right directory, install dependencies.
```
git clone https://rbcgithub.fg.rbc.com/ziv0/postmen.git
cd postmen
npm install
```

### Running
To run it in the browser, run `npm start` and go to `http://localhost:3000`.

To run it as an Electron desktop app, run `npm run electron-frontend`.

### Instructions
Once the app has loaded, click 'Instructions' for an explanation of the syntax for conditions/headers/params. 

### Debugging
Install the React Chrome extension so you can use it in the Chrome debugger. Run `npm start` and go to `http://localhost:3000/` and use the React tab of the Chrome debugger to see the application's state, which is held in `RequestsForm`. 

## Contributing
Please contribute to this project! [`RequestsForm.js`](https://rbcgithub.fg.rbc.com/ziv0/postmen/blob/master/src/components/RequestsForm.js) contains most of the "business logic" of Postmen and is where you should start if you want to add some functionality. 

If you contribute, please add your name to `contributors.txt` with a brief description of what you did, so everyone can get the credit they deserve!

## Gifs!
![Conditions passing](https://rbcgithub.fg.rbc.com/ziv0/postmen/blob/master/public/condition-success.gif)
Conditions passing and request being fired

![Conditions rejecting](https://rbcgithub.fg.rbc.com/ziv0/postmen/blob/master/public/condition-fail.gif)
Conditions not passing and request not being fired

hi!