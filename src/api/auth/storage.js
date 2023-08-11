const request = require('request')
const sync_request = require('sync-request')
const config = require('../../configReader')().config;
const storage_host = config.service.storage.domain;
const fs = require('fs')
var multiparty = require('multiparty');

function verify_folder(creator) {

  // list existing foler
  let folder_name = creator
  let res = sync_request('GET', storage_host
    + '/bucket/?creator=' + creator)
  let response_json = JSON.parse(res.getBody())
  if (response_json && response_json.data
    && response_json.data.length > 0) {
    for (let i = 0; i < response_json.data.length; i++) {
      let item = response_json.data[i]
      if (item['type'] === 'folder'
        && item['name'] === folder_name) {
        return item['id']
      }
    }
  }

  // if not exist, create one
  let res2 = sync_request('POST', storage_host
    + '/bucket/', {
    json: {
      name: folder_name,
      creator: creator
    }
  })
  let response_json2 = JSON.parse(res2.getBody())
  return response_json2.data.id
}

const list_folder = function (app) {

  return async (ctx, next) => {
    try {
      console.log('================list folder')
      // http://host/storage/folder/918714f8-9dc1-4d19-89be-041a0c74c94e/
      const url = storage_host + '/folder/' + ctx.params.folder_uid + '/';
      let result = request.get({
        url: url,
        json: true,
      });
      ctx.response.body = result;

    } catch (err) {
      ctx.response.body = err
    }
  }
};

const list_bucket = function (app) {

  return async (ctx, next) => {
    try {
      console.log('================list bucket')
      // http://172.31.26.165:8000/storage/bucket/?creator=lqw@openuse.io
      const url = storage_host + '/bucket/?creator=' + ctx.params.creator;
      console.log('req:', url)
      let result = request.get({
        url: url,
        json: true,
      });
      ctx.response.body = result;

    } catch (err) {
      ctx.response.body = err
    }
  }
};

const download_file = function (app) {
  return async (ctx, next) => {
    try {
      //http://172.31.26.165:8000/storage/file/a51a2b0c-484d-4899-a2a8-258daa8d9a75/?downloader=lqw1@openuse.io
      console.log('file download enter...')
      const url = storage_host + '/file/' + ctx.params.file_id + '/?downloader=audit@openuse.io';
      console.log('req:', url)
      let result = request.get({
        url: url,
        json: true,
      });

      ctx.response.body = result;

    } catch (err) {
      ctx.response.body = err
    }
  }
};

function parseForm(ctx) {
  return new Promise(function (resolve, reject) {

    try {
      var form = new multiparty.Form();

      form.parse(ctx.req, function (err, fields, files) {
        if (err) {
          console.log('error 1...............')
          reject(0)
        } else {
          console.log('fields=', fields);
          console.log('files=', files)
          resolve({ fields: fields, files: files })

        }
      })

    } catch (err2) {
      reject(0)
    }

  });
}

const upload_file = function (app) {

  return async (ctx, next) => {
    try {
      console.log('begin storage upload=')
      let form_info = await parseForm(ctx)
      if (form_info === 0) {
        return
      }
      let fields = form_info.fields;
      let files = form_info.files;


      console.log('fields=', fields);
      console.log('files=', files)

      let folder_id = verify_folder(fields.creator[0])
      console.log('bucket id:', folder_id)
      if (!folder_id || folder_id === '') {
        return
      }

      var options =
      {
        method: 'POST',
        url: storage_host + '/folder/' + folder_id + "/upload/",
        headers:
        {
          'cache-control': 'no-cache',
          'content-type': 'multipart/form-data'
        },
        formData:
        {
          file:
          {
            value: fs.createReadStream(files.file[0].path),
            options:
            {
              filename: files.file[0].originalFilename,
              contentType: null,
            }
          },
          creator: fields.creator
        }
      };

      let result = request(options)

      ctx.response.body = result


    } catch (err){
      return
    }
    
  }
};

module.exports = {
  'GET /storage/bucket/:creator': {
    method: list_bucket,
    auth: []
  },
  'GET /storage/folder/:folder_uid': {
    method: list_folder,
    auth: []
  },
  'GET /storage/file/:file_id': {
    method: download_file,
    auth: []
  },
  'POST /storage/upload': {
    method: upload_file,
    auth: []
  }
}