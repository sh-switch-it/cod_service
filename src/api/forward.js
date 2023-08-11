const fs = require('fs');
const r = require("request");
const request =  (url, method, token, params) => {
    let option = {
        method: method,
        url: url,
        json: true,
        headers: {
            "accept": "*/*"
        },
        rejectUnauthorized:false
    };
    if(token) {
        option.headers = {
            "authorization": "Bearer " + token,
            "accept": "*/*"
        }
    }
    if(method.toLowerCase() !== 'get'){
        option.body = params;
    }else{
        option.qs = params;
    }
    return new Promise(function(resolve, reject) {
        r(option, function(err, response, body){
            if (err) {
                console.error('forward error', err.stack);
                let errorInfo = {
                    status: 500,
                    detail: {
                        message:"Internal error"
                    }
                }
                reject(errorInfo)
            } else if (response.statusCode >= 400) {
                console.error('forward error', response.body);
                let errorInfo = {
                    status: response.statusCode,
                    detail: {
                        code: response.body.code,
                        message: response.body.detail
                    }
                }
                reject(errorInfo)
            } else {
                console.error('forward success', 'sucess', body);
                resolve(body)
            }
        })
    })
}

const requestFileUpload = (url, token, params,file) => {
    let fileStream = fs.createReadStream(file.path);
    let form_data = {
        "file": {
            value: fileStream,
            options: {
                filename: file.name,
                contentType: file.type
            }
        }
    };
    if(params){
        form_data = Object.assign(form_data,params);
    }
    return new Promise((resolve, reject) =>{
        r.post({
            url: url,
            headers: {
                "authorization": "Bearer " + token,
                "accept": "*/*"
            },
            formData: form_data
        }, (err, response, body)=>{
            if (err) {
                console.error('[forward upload file error]', 'error', err.stack);
                let errorInfo = {
                    status: 500,
                    detail: {
                        message:"Internal error"
                    }
                }
                reject(errorInfo)
            } else if (response.statusCode >= 400) {
                console.error('[forward upload file error]', 'error', response.body);
                let errorInfo = {
                    status: response.statusCode,
                    detail: {
                        code: response.body.code,
                        message: response.body.detail
                    }
                }
                reject(errorInfo)
            } else {
                console.error('[forward upload file success]', 'sucess', body);
                resolve(body)
            }
        });
    });
}

module.exports = {
    request,
    requestFileUpload
}