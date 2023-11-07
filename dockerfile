FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu-20.04

ARG DEBIAN_FRONTEND=noninteractive

#User defined variables
ARG NODE_VERSION='18.18.2'

ENV user 'alois-dev'
ENV NVM_DIR /home/${user}/.nvm

#Update package list and install sudo
RUN apt-get update && apt-get -y install sudo ssh

#Create user moringastudent and enable use of /bin/bash which can source
#the rvm scripts
RUN useradd -m -d /home/${user} -s /bin/bash ${user} && \
    chown -R ${user} /home/${user} && \
    adduser ${user} sudo && \
    echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

USER ${user}

#Install prerequisites to node and ruby installation such as curl and other apt commands
RUN sudo apt-get update && sudo apt-get install -y \
    apt-utils \
    curl \
    software-properties-common

# Get nvm install script from github and pipe to bash interpreter binary for execution
RUN curl -o- curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

#Install nodejs NODE_VERSION using nvm
RUN /bin/bash -l -c "source $NVM_DIR/nvm.sh && nvm install ${NODE_VERSION}"

#Set nvm alias default to nodejs NODE_VERSION
RUN /bin/bash -l -c "source $NVM_DIR/nvm.sh && nvm alias default v${NODE_VERSION}"

#Confirm node, npm and ruby versions installed
RUN /bin/bash -l -c "source $NVM_DIR/nvm.sh && node --version"
RUN /bin/bash -l -c "source $NVM_DIR/nvm.sh && npm --version"
RUN git --version

COPY src /home/${user}/src
WORKDIR /home/${user}/src
RUN sudo chown -R ${user}:${user} /home/${user}/src && sudo chmod 750 /home/${user}/src

RUN /bin/bash -l -c "source ${NVM_DIR}/nvm.sh  && npm install"

ENTRYPOINT ["bash","-c","source ${NVM_DIR}/nvm.sh && node reportEnergy.js"]