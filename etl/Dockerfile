FROM neo4j:3.5

RUN apt-get update -yqq
RUN apt-get install -y python3-dev python3-pip
RUN pip3 install awscli pandas numpy pytz

COPY . /etl
WORKDIR /etl
ENTRYPOINT ["/bin/sh", "-c"]
CMD ["./etl.sh"]
