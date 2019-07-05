FROM logstash:7.2.0

USER root

RUN yum install -y epel-release
RUN yum install -y python-pip
RUN pip install awscli

USER logstash

COPY logstash.conf /usr/share/logstash/pipeline/logstash.conf
COPY docker-entrypoint /usr/local/bin/docker-entrypoint
COPY --chown=logstash . /etl
WORKDIR /etl

