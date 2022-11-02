The api on my pc was throwing some cors errors so it is better to start browser without cors (for chrome flags are --disable-web-security --user-data-dir=~ ).
For the installing packages type npm i in terminal.
For building optimized build-npm run build
For test npm run cypress
Then you should set access token for the api in ./src/store/reducers/user
And the app is ready for dev and tests

At many places are todos(point api errors/strange behaviour/ more complicated logic)
