
## Introduction

This documentation provides instructions for installing, running, and testing the server. The server is designed to cache data in both the Node application memory and Redis, and it handles concurrent requests efficiently.

## Installation
### Prerequisites
-Node.js (v14 or higher)

-npm (v7 or higher)

-Docker (for running Redis and PostgreSQL)

## Steps:
### Clone the Repository:

```bash
$ git clone <repository-url>
$ cd <repository-directory>
```
### Install Dependencies:

```bash
$ npm install
```
### Set Up Environment Variables:
Create a directory environments  in the root directory with the local.env file content:
```bash
APP_PORT=3000
APP_HOST=localhost

POSTGRES_PORT=5435
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=dvdrental

REDIS_PORT=6379
REDIS_HOST=localhost
REDIS_PASSWORD=redispass
REDIS_URL=redis://localhost:6379

```
### Run Docker Containers:
```bash
# development
$ npm run start:docker
```
### Running the Server
```bash
# development
$ npm run start:local
```
## Test

```bash
# unit tests
$ npm run test
```
