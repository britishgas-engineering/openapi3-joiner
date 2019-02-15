# Open API 3 joiner
Node script to merge multiple Open API 3 specifications into single specification

In a microservice architecture, each microservice has its own API documentation.
Often the apis are exposed behind an API gateway to give single interface to the clients.
That creates a need to have a sigle API specification.

This script is a tool to merge multiple Open API 3 specifications (json or yaml) 
into a single specification

# How to run?
`npm install`

`node invoke.js`
(Please refer [invoke.js](./invoke.js) for more details)

