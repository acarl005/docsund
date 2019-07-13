FROM neo4j:3.5

MAINTAINER Andrew Carlson

RUN apt-get update -yqq
RUN apt-get install -yqq python3-dev python3-pip
RUN pip3 install awscli

COPY . /etl
WORKDIR /etl
RUN pip3 install -r requirements.txt

ENTRYPOINT ["/bin/sh", "-c"]
CMD ["./etl.sh"]
