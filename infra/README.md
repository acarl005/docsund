# Docsund Infrastructure

This software is deployed with [Kubernetes](https://kubernetes.io/).
This guide will walk you through deploying it on [Amazon EKS](https://aws.amazon.com/eks/).

## What You'll Need

1. An email dataset
1. `kubectl`
1. Python 3
1. Optional: `eksctl`

## 1. Formatting your Data

You'll need a CSV file in an S3 bucket. The CSV file should have the following columns:

1. **id** - A unique identifier. Choose your IDs however you like.
1. **to** - The email address(es) that this email is sent to, as a comma-separated list.
1. **from** - The email address that sent the email.
1. **subject** - The subject string.
1. **body** - The body string.
1. **date** - The datetime that it was sent, formated as an [ISO 8601](https://www.google.com/search?q=iso+date+string&oq=iso+date+string&aqs=chrome..69i57j0l5.2758j1j4&sourceid=chrome&ie=UTF-8) string, e.g. `2019-07-06T02:01:12Z`.

As an example, you can download the [Enron Email Dataset](https://www.kaggle.com/wcukierski/enron-email-dataset/version/2) from Kaggle and unzip it.
`cd` into `etl/` of this repo and move the CSV file here.
Run `python preprocess.py` to get it in the correct format.
Upload this to an [AWS S3 bucket](https://aws.amazon.com/s3/).

## 2. Create a Kubernetes Cluster

You can `cd` into `infra/` and run `./create-cluster.sh`. 
If you want SSH access to the nodes, edit the script to add the `--ssh-access` and `--ssh-public-key` options.
This assumes you have `eksctl` installed.
You can create the cluster with whichever method you like.

Optionally, you can enable the Kubernetes Dashboard by running `./enable-dashboard.sh`, which is just a script for [this tutorial](https://docs.aws.amazon.com/eks/latest/userguide/dashboard-tutorial.html).


## 3. Create Secrets

There are 2 sets of [Kubernetes secrets](https://kubernetes.io/docs/concepts/configuration/secret/):

1. `aws-secrets` with keys `access_key_id`, `s3_csv_path`, and `secret_access_key`. The `s3_csv_path` is an S3 path to your CSV file. The containers will download the data from there. The `access_key_id` and `secret_access_key` are credentials to access the bucket. You can `cd` into `infra/secrets/aws-secrets`, create text files for the secrets, and run `./create.sh`.
1. `neo4j-secrets` with key `password` for the database password.

## 4. ETL the Entities Data for Neo4j

Create a persistent volume, and ETL the data into it.
It will format the data to be consumed by Neo4j.

```sh
kubectl apply -f neo4j-volume.yml
kubectl apply -f etl-job.yml
```

Once this job is done, the volume is ready to be mounted for Neo4j.

## 5. Launch Neo4j

```sh
kubectl apply -f neo4j-deployment.yml
kubectl apply -f neo4j-service.yml
```

## 6. Launch Elasticsearch and Logstash

[Elasticsearch](https://www.elastic.co/products/elasticsearch) powers the search feature, and [Logstash](https://www.elastic.co/products/logstash) ETLs the data into it.

```sh
kubectl apply -f elasticsearch-deployment.yml
kubectl apply -f elasticsearch-service.yml
kubectl apply -f logstash-deployment.yml
```

**Warning:** On some versions of EKS, an error occurs with `mmapfs`.
You might need to SSH into the Node and change a setting.
[See here](https://www.elastic.co/guide/en/elasticsearch/reference/current/vm-max-map-count.html).

## 7. Launch the API

This is the intermediary between the databases and web UI.

```sh
kubectl apply -f entities-api-deployment.yml
kubectl apply -f entities-api-service.yml
```

## 8. Launch the UI

Finally, launch the Web interface.

```sh
kubectl apply -f docsund-ui-deployment.yml
kubectl apply -f docsund-ui-service.yml
```

**Warning:** Make sure TCP traffic on port 80 is permitted in the security group in your node group.
This may not be enabled by default.
