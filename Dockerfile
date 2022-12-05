FROM node:14-slim as build

WORKDIR /app

COPY ui/ /app/
RUN npm install -g npm@latest
RUN npm install

RUN npm run build-docker

FROM akariv/dgp-app:latest

COPY requirements.dev.txt .
RUN sudo pip install -U -r requirements.dev.txt

COPY --from=build /app/dist/mapali/ ui/dist/ui/

COPY configuration.json dags/
COPY server_extra.py .

COPY taxonomies taxonomies
