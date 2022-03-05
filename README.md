<h1 align="center">
  Divide & Conquer
</h1>
<h3 align="center">
  Large teams retrospectives
</h3>
<br>

[![Released under the MIT license.](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![All Contributors][all-contributors-badge]](#contributors)
[![PRs welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Code of Conduct][coc-badge]][coc]

## Table of Contents

- [Table of Contents](#table-of-contents)
- [❗ Code of Conduct](#-code-of-conduct)
- [🙌🏻  How to Contribute](#--how-to-contribute)
- [🏃  How to Run - Dev mode](#--how-to-run---dev-mode)
  - [Requirements](#requirements)
  - [Env files](#env-files)
  - [Database](#database)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [🏃  How to Run - with docker](#--how-to-run---with-docker)
- [Usage](#usage)
- [📝 License](#-license)
- [Contributors ✨](#contributors-)

## ❗ Code of Conduct

We expect everyone to abide by our [**Code of Conduct**](.github/CODE_OF_CONDUCT.md). Please read it. 🤝

## 🙌🏻  How to Contribute

Check out our [**Contributing Guide**](.github/CONTRIBUTING.md) for information on contributing.

## 🏃  How to Run - Dev mode

To run the project you will need the requirements listed below and configure the env files as described in the example.
In the next section [**How to run - with docker**](#--how-to-run---with-docker) you can find instructions on how to run the entire project with docker.

### Requirements

1. Node
2. Docker
3. Env files

### Env files

An `.env` file must be present in each app folder (frontend and backend) and it's also needed the `.env` in the root folder of the project in order to create the database.
This files are already provisioned as an example (`.env.example`) in the respective folders and you can use and edit them. In order to use the example, please remove the suffix `.example` from the file name.

The frontend `.env` file have the parameter named *SECRET* that is required by next-auth on the frontend and to generate it just run the following command `openssl rand -base64 32` in the shell then paste it in the `.env` file.  

### Database

In the dev mode the database is the only resource you need to build with docker.
Before running the docker compose command you should edit the `rs-init.sh` file permissions. To do that you can run `chmod +x database/rs-init.sh` from the project's root folder. After this you should run the follow command `docker-compose up -d mongo mongo2` in the project's root folder.
The mongo image is downloaded, two containers are built and a database is created with the name that is passed in the env file parameter called *DB_NAME*. After the containers have been built you should start the replica set by running the follow comand `docker exec mongo /scripts/rs-init.sh`. (It will take 30s to conclude the process - after the first *bye* appears you should wait)

### Backend

To run this application for the first time run `npm i` inside the backend folder. Once you have installed the dependencies, simply run: `npm run start:dev`

### Frontend

To run this application for the first time run `npm i` inside the frontend folder. Once you have installed the dependencies, simply run: `npm run dev`

## 🏃  How to Run - with docker

In order to run the whole project with docker you need to prepare the `.env.example` file that is present in the root folder of the project and from there run the following command: `docker-compose up -d`. After the containers have been built you should start the replica set by running the follow comand `docker exec mongo /scripts/rs-init.sh`. (It will take 30s to conclude the process - after the first *bye* appears you should wait)

## Usage

The backend will run on `http://localhost:BACKEND_PORT` and the frontend on `http://localhost:3000`. Be aware the frontend root page ("/") is the landing page and has not yet been built so you must manually enter one of the following routes:

- "/dashboard": dashboard
- "/auth": authentication

You must register to access the dashboard page

## 📝 License

Licensed under the [MIT License](./LICENSE).

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/nunocaseiro"><img src="https://avatars.githubusercontent.com/u/90208434?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Nuno Caseiro</b></sub></a><br /><a href="https://github.com/xgeekshq/divide-and-conquer/commits?author=nunocaseiro" title="Code">💻</a> <a href="https://github.com/xgeekshq/divide-and-conquer/commits?author=nunocaseiro" title="Tests">⚠️</a> <a href="#infra-nunocaseiro" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/xgeekshq/divide-and-conquer/commits?author=nunocaseiro" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/rpvsilva"><img src="https://avatars.githubusercontent.com/u/25325644?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Rui Silva</b></sub></a><br /><a href="https://github.com/xgeekshq/divide-and-conquer/commits?author=rpvsilva" title="Code">💻</a> <a href="https://github.com/xgeekshq/divide-and-conquer/pulls?q=is%3Apr+reviewed-by%3Arpvsilva" title="Reviewed Pull Requests">👀</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

[all-contributors-badge]: https://img.shields.io/github/all-contributors/xgeekshq/divide-and-conquer?color=orange&style=flat-square
[coc]: .github/CODE_OF_CONDUCT.md
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square

------------------------------------------------------------------------------------------------------
<p align="center">
  <a align="center" href="https://www.xgeeks.io/">
    <img alt="xgeeks" src="https://github.com/xgeekshq/oss-template/blob/main/.github/IMAGES/xgeeks_Logo_Black.svg" width="100">
  </a>
</p>
<h4 align="center">xgeeks Open Source</h4>
