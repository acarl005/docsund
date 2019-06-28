FROM ubuntu:latest

MAINTAINER Andrew Carlson

RUN apt-get update -yqq
RUN apt-get install -yqq python3-pip python3-setuptools

COPY . /app
WORKDIR /app
RUN pip3 install -r requirements.txt

EXPOSE 5000 

CMD python3 api.py

