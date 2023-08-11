## Install
```
yarn install 
//npm install
```

## Run
```
//for aws env
npm run start_aws

//for prod env
npm run start_prod
```

## Run with pm2
```
//aws env
pm2 start npm -- run start_aws

//prod env
pm2 start npm -- run start_prod
```
//aws-prod env
pm2 start npm --name booking-svc -- run start_aws_prod