# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, start by running `npm install` to retrieve mandatory dependencies, then you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

:information_source: By default, the project is meant to be run and opened on same host than [the backend](https://github.com/ratchet34/blindtest-reforged-back). If your use case expects your pages to be opened by browsers on different hosts than the one hosting the backend, you need to specify the backend address  when building the front end. To do so, export the `REACT_APP_WEBSOCKET_SERVER_ADDRESS` as en environment variable when building your application. For example : 
```
REACT_APP_WEBSOCKET_SERVER_ADDRESS=ws://192.168.1.254:6969 npm start
REACT_APP_WEBSOCKET_SERVER_ADDRESS=ws://sunflower.local:6969 npm run build
```

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### Admin panel

To access the admin panel navigate to where the app is served and add "mode=admin" to the query parameters i.e.: http://localhost:3000?mode=admin
