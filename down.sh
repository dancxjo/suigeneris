#!/bin/bash
docker compose down
docker volume ls --filter name=qdrant -q | xargs docker volume rm
sudo chown -R dancxjo:dancxjo static
rm -rf thoughts.txt
rm -rf static
