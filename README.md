# Angular SSO Example

This project shows how to use the node-expose-sspi module with Angular.

## Usage

You need to be on a Windows OS.

```
git clone https://github.com/jlguenego/angular-sso-example.git
cd angular-sso-example

cd back
npm i
npm start

cd ..
cd front
npm i
npm start -- -o
```

A browser opens `http://localhost:4200`.

Enjoy!

Just read the code to understand.

## Note

Instead of using the `back` directory, you can also use the `back-fastify` directory.

It is the same code behavior, but using Fastify instead of express.

## Author

Jean-Louis GUENEGO
