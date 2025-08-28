FROM jenkins/jenkins:lts

USER root

RUN apt update && apt install -y docker.io && apt install -y docker-compose

RUN docker --version

USER jenkins
