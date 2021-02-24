# New commer FE

#### Start dev server

With npm:
```
npm start
```

With yarn:
```
yarn start
```

#### Start production server
After build, application is saved in dist folder which is ready to be deployed.

With npm:
```
npm run build
npm run serve
```

With yarn:
```
yarn build
yarn serve
```

Application has its own javascript router, to work properly, 
you have to set fallback from all URLs to index.html file on your server.
