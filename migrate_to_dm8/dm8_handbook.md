docker load -i dm8_20220822_rev166351_x86_rh6_64_ctm.tar

docker run -d --name dm8 --restart=always --privileged=true \
-p 15236:5236 \
-v ~/docker_v/dmdb_data/data:/opt/dmdbms/data \
dm8_single:dm8_20230808_rev197096_x86_rh6_64



jdbc driver download url
https://eco.dameng.com/download/