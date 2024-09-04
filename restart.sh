#!/bin/bash
docker compose down
docker volume ls --filter name=qdrant -q | xargs docker volume rm
sudo chmod -R dancxjo:dancxjo static/*
rm -rf static/*
docker compose up
