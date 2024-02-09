# Browser Battleship Game

A browser version of Battleship table top game using react remix and nodejs with socket.io for peer to server communication.
Play with friends!

# Build

Clone the repo and then run

```
npm install
```

to install all the required packages

**Client (React Application)**
To allow for connection to the socket server over the internet you will have to navigate to this file.

```
your_dir_name/app/socket.tsx
```

and change the variable `SERVER_IP_ADDRESS` to the public ip address of the machine hosting the application

**Server**
The is currently set to a `3000` if you change it make sure to reflect the change in the client application aswell.

**Build the application to serve**
Once your happy with above you can run the command `npm run build` in the main directory to build the static client

## Run

Running is simple one you have build the application just run the command `npm run server`
then just connect via the localhost:port or by public address.
