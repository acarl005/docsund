eksctl create cluster --name docsund \
                      --version 1.13 \
                      --nodegroup-name kube-workers \
                      --node-type t3.medium \
                      --nodes 4 \
                      --nodes-min 1 \
                      --nodes-max 4 \
                      --node-ami auto \
                      --ssh-access \
                      --ssh-public-key andy-key

# to delete it:
# eksctl delete cluster docsund --wait
