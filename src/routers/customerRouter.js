
const Router = require('koa-router');
const multer = require('@koa/multer');
const readXlsxFile = require('read-excel-file/node');
const writeXlsxFile = require('write-excel-file/node');
const customerService = require('../service/customerService');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname ,'/upload_temp'))
    },
    filename: function (req, file, cb) {
        let type = file.originalname.split('.')[1]
        cb(null, `${file.fieldname}.${type}`)
    }
})
//文件上传限制
const limits = {
    fields: 10,//非文件字段的数量
    fileSize: 500 * 1024,//文件大小 单位 b
    files: 1//文件数量
}

const upload = multer({storage,limits})
const customerRouter = new Router({prefix:'/api'});

customerRouter.get('/customers', async(ctx, next) => {
    const result = await customerService.getCustomers();
    ctx.body = result;
})

customerRouter.put('/customers', async(ctx, next) => {
    const newCustomer = ctx.request.body;
    const result = await customerService.updateCustomer(newCustomer);
    ctx.body = result;
})

customerRouter.post('/customers', async(ctx, next) => {
    let body = ctx.request.body;
    // console.log("body",JSON.stringify(body));
    const result = await customerService.addCustomer(body.name,body.phone,body.org,body.job);
    ctx.body = result;
})

customerRouter.delete('/customers/:id', async(ctx, next) => {
    let id = ctx.params.id;
    const result = await customerService.removeCustomer(id);
    ctx.body = result;
})
customerRouter.post(
    '/api/file_customers',
    upload.single('file'),
    async (ctx,next) => {
			const filePath = path.join(__dirname ,'/upload_temp');
			console.log('file path',filePath );
			const rows = await readXlsxFile(fs.createReadStream(filePath + '/file.xlsx'));
			for (let i = 1; i < rows.length; i++) {
				const item = rows[i];
				const phone = item[1].toString();
				const existed = await customerService.isCustomerExist(phone);
				if(existed){
					const updateCustomer = {
						id: existed.id,
						name: item[0],
						phone: phone,
						org: item[2],
						job: item[3],
						status: 1
					}
					await customerService.updateCustomer(updateCustomer);
				} else {
					await customerService.addCustomer(item[0],phone,item[2],item[3]);
				}
			}
			ctx.body = 'ok';
    }
  );

  customerRouter.get(
    '/file_customers',
    async (ctx,next) => {
		const data = [];
		const HEADER_ROW = [
			{
			  value: '姓名',
			  fontWeight: 'bold'
			},
			{
			  value: '手机',
			  fontWeight: 'bold'
			},
			{
			  value: '部门',
			  fontWeight: 'bold'
			},
			{
			  value: '职务',
			  fontWeight: 'bold'
			}
		  ];
		data.push(HEADER_ROW);
		const customers = await customerService.getCustomers();
		customers.map((item) => {
			const nameField = {
				type: String,
				value: item.name
			};
			const phoneField = {
				type: String,
				value: item.phone
			};
			const orgField = {
				type: String,
				value: item.org
			};
			const jobField = {
				type: String,
				value: item.job
			};
			const row = [nameField,phoneField,orgField,jobField];
			data.push(row);
		});
		await writeXlsxFile(data, {
			filePath: __dirname + '/download_temp/download.xlsx'
		});
		ctx.set('Content-disposition', 'attachment; filename=' + "download.xlsx");
		ctx.set('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		ctx.body = fs.createReadStream(__dirname + '/download_temp/download.xlsx');
		
    }
  );

  module.exports = customerRouter;