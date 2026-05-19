FROM node:jod-trixie-slim
#FROM node:20

RUN apt update
RUN apt upgrade -y

RUN apt install -y nano iputils-ping curl borgbackup cron git sqlite3

# ENV PATH="/home/scan/.local/bin:$PATH"


WORKDIR /root/ScanApp
#RUN npm
#
# RUN npm config set user 0
# RUN npm config set unsafe-perm true

#CMD ["bash", "start.sh"]


# docker build -t scan .
