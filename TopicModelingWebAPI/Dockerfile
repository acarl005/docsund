FROM ubuntu:latest

MAINTAINER Andrew Carlson

RUN apt-get clean -yqq && \
    apt-get update -yqq && \
    apt-get install -y curl unzip python3-pip

# Install OpenJDK-8
RUN apt-get update -yqq && \
    apt-get install -y openjdk-8-jdk && \
    apt-get install -y ant && \
    apt-get clean;

# Fix certificate issues
RUN apt-get update -yqq && \
    apt-get install ca-certificates-java && \
    apt-get clean && \
    update-ca-certificates -f;

# Setup JAVA_HOME -- useful for docker commandline
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/

COPY . /app
WORKDIR /app
RUN pip3 install awscli
RUN pip3 install -r requirements.txt

RUN curl -OL http://mallet.cs.umass.edu/dist/mallet-2.0.8.zip && \
    unzip mallet-2.0.8.zip
ENV MALLET_HOME /app/mallet-2.0.8

EXPOSE 5000 

CMD ["./start-prod"]

