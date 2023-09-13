#Ubuntu 22环境
##1 安装docker-ce
```
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```
```
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```
```
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo service docker start
```

##2 安装nodejs v16
```
curl -sL https://deb.nodesource.com/setup_16.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt install nodejs
sudo apt-get install -y nodejs
```

##3 安装git （ubuntu 22 无需安装）

##4 生成ssh key
```
ssh-keygen -t ed25519 -C "momoko8443@163.com"
```

##5 docker安装postgresql
```
sudo mkdir ~/docker_v
sudo mkdir ~/docker_v/postgres
sudo docker run -d --name cod-postgres -e POSTGRES_PASSWORD=admin -e PGDATA=/var/lib/postgresql/data/pgdata -v ~/docker_v/postgres:/var/lib/postgresql/data -p 15432:5432 postgres
```

##6 clone code
```
mkdir ~/workspaces
git clone git@gitee.com:sh-switch-it/cod-server.git
git clone git@gitee.com:sh-switch-it/cod-web.git
```

##7 install
```
cd ~/workspaces/cod-server
npm install

cd ~/workspaces/cod-web
npm install
```
##8 build
```
cd ~/workspaces/cod-web
npm run build:dev2
cp -r build ../cod-server/
sudo npm install pm2 -g
pm2 start "npm run start_txc" --name cod
```
##9 install Python3 (已经有了，不用安装)
```
sudo apt update && sudo apt upgrade -y
sudo apt install software-properties-common -y
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt install python3.10
```

##10 install edge-tts
```
pip3 install edge-tts
```
需要add path 到 ~/.bashrc 
```
export PATH="/home/lighthouse/.local/bin:$PATH"
export PATH="/Users/jakezheng/Library/Python/3.9/bin:$PATH"
```

```
edge-tts --voice zh-CN-XiaoyiNeural --text "市一紧急召援，信息科的范文君同志,请于5分钟内,紧急前往急诊室参与病患救治" --write-media hello.mp3 --write-subtitles hello.vtt
```

##11 docker install opentts
```
docker run -it -d -p 15500:5500 synesthesiam/opentts:zh --no-espeak 
```
###http request text to wav
```
http://127.0.0.1:15500/api/tts?
voice=coqui-tts:zh_baker
&text=
&vocoder=high
&denoiserStrength=0.03
&cache=false
```


##Other
```
docker run -p 18080:8080 -e SWAGGER_JSON_URL=http://192.168.31.163:8088/ari/api-docs/resources.json?api_key=asterisk:123456 swaggerapi/swagger-ui
```


#Centos安装
##1 安装docker
```
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl start docker
``````

##2 安装nodejs
```
sudo yum -y update
sudo yum -y install nodejs npm
```
##3 安装git
```
sudo yum -y install git
```


##4 安装 espeak
```
sudo yum install espeak-ng
```