# Docsund Infrastructure

This software is deployed with [Kubernetes](https://kubernetes.io/).
This guide will walk you through deploying it on [Amazon EKS](https://aws.amazon.com/eks/).

## What You'll Need

1. An email dataset
1. `kubectl`
1. Python 3
1. `eksctl`

## 1. Formatting your Data

You'll need a CSV file in an S3 bucket. The CSV file should have the following columns:

1. **id** - A unique identifier. Choose your IDs however you like.
1. **to** - The email address(es) that this email is sent to, as a comma-separated list.
1. **from** - The email address that sent the email.
1. **subject** - The subject string.
1. **body** - The body string.
1. **date** - The datetime that it was sent, formated as an [ISO 8601](https://www.google.com/search?q=iso+date+string&oq=iso+date+string&aqs=chrome..69i57j0l5.2758j1j4&sourceid=chrome&ie=UTF-8) string, e.g. `2019-07-06T02:01:12Z`.

As an example, you can download the [Enron Email Dataset](https://www.kaggle.com/wcukierski/enron-email-dataset/version/2) from Kaggle and unzip it.
`cd` into `preprocess/` of this repo, move the CSV file here, and rename it `enron_raw.csv`.
Run `python enron_pre.py` to get it in the correct format.
Upload this to an [AWS S3 bucket](https://aws.amazon.com/s3/).

## 2. Create a Kubernetes Cluster

First, `cd` into `infra/cluster/`.

Create an keypair for SSH access. Note: If you don't want to enable SSH access, you'll need to remove that setting in `cluster.yml`.

```sh
ssh-keygen -t rsa -b 4096 -f ~/.ssh/kube-key
eksctl create cluster -f cluster.yml
```

Optionally, you can enable the Kubernetes Dashboard by running `./enable-dashboard.sh`, which is just a script for [this tutorial](https://docs.aws.amazon.com/eks/latest/userguide/dashboard-tutorial.html).

```sh
./enable-dashboard.sh
# outputs the auth token and link you need to get into the dashboard
```


## 3. Create Secrets

There are 2 sets of [Kubernetes secrets](https://kubernetes.io/docs/concepts/configuration/secret/):

1. `aws-secrets` with keys `access_key_id`, `s3_csv_path`, and `secret_access_key`. The `s3_csv_path` is an S3 path to your CSV file. The containers will download the data from there. The `access_key_id` and `secret_access_key` are credentials to access the bucket. You can `cd` into `infra/secrets/aws-secrets`, create text files for the secrets, and run `./create.sh`.
1. `neo4j-secrets` with key `password` for the database password. **Warning: Make sure you don't have an extra newline at the end of your password string. If you create the secret from a file, for example, many editors add this automatically so watch out!**

## 4. ETL the Entities Data for Neo4j

Create a persistent volume, and ETL the data into it.
It will format the data to be consumed by Neo4j.
`cd` into `ingest/`.

```sh
cd ingest/
./create
```

Once this job is done, the volume is ready to be mounted for Neo4j.

In the cluster created step, we created a high-powered node (which is expensive) for running this specific job.
We can delete it now that it's done.

```sh
eksctl drain nodegroup --cluster docsund docsund-high-power
eksctl delete nodegroup --cluster docsund docsund-high-power
```

## 5. Launch Neo4j, Elasticsearch, and Logstash

[Elasticsearch](https://www.elastic.co/products/elasticsearch) powers the search feature, and [Logstash](https://www.elastic.co/products/logstash) ETLs the data into it.

[Neo4j](https://neo4j.com/) powers the entity explorer visualization.

`cd ..` back up to the `infra/` directory.

```sh
kubectl apply -f data-layer
```

## 6. Launch the API and UI

This is the intermediary between the databases and web UI.

```sh
kubectl apply -f app-layer
```

**Warning:** Make sure TCP traffic on port 80 is permitted in the security group in your node group.
This may not be enabled by default.

# Appendix

## Deploy Locally

To try locally, you can use [Minikube](https://kubernetes.io/docs/setup/learning-environment/minikube/) instead of EKS.

Here is the recommended command to create a cluster:

```sh
minikube start --cpus 4 --memory 8192 --disk-size 30g
minikube dashboard
```

Note: If you do it this way, you *may* need to change a setting in your Minikube VM to get Elasticsearch to run.
See [this issue](https://github.com/kubernetes/minikube/issues/2367).
Get more info about this See [here](https://www.elastic.co/guide/en/elasticsearch/reference/current/vm-max-map-count.html),
[here](https://stackoverflow.com/questions/42300463/elasticsearch-bootstrap-checks-failing/47211716), or
[here](https://stackoverflow.com/questions/41192680/update-max-map-count-for-elasticsearch-docker-container-mac-host).

## Multiple Datasets

You can deploy multiple datasets in their own cluster at once.
We recommend using different namespaces in Kubernetes.
You will also need to scale up the nodes in the node group.

```sh
kubectl config set-context --current --namespace enron
kub create namespace enron

eksctl scale nodegroup --cluster docsund --nodes 7 docsund-workers
```


```sh
curl -L 'https://github.com/neo4j-contrib/neo4j-graph-algorithms/releases/download/3.5.4.0/graph-algorithms-algo-3.5.4.0.jar' \
  -o ~/neo4j/plugins/graph-algorithms-algo-3.5.4.0.jar
docker run --rm -p 7474:7474 -p 7687:7687 --env NEO4J_AUTH=neo4j/corncorn --env 'NEO4J_dbms_security_procedures_unrestricted=algo.*' -v ~/neo4j/plugins/:/plugins -v ~/neo4j/data:/data neo4j:3.5.6
```
