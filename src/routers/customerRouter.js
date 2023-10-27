
import Router from 'koa-router';
import multer from '@koa/multer';
import readXlsxFile from 'read-excel-file/node';
import writeXlsxFile from 'write-excel-file/node';
import customerService from '../service/customerService';
import configurationDAO from '../db/dao/configurationDAO';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url))
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const filePath = path.resolve(__dirname, '../../upload_temp');
		cb(null,filePath);
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

const upload = multer({ storage, limits })
const customerRouter = new Router({ prefix: '/api' });

customerRouter.get('/customers', async (ctx, next) => {
	const result = await customerService.getCustomers();
	ctx.body = result;
})

customerRouter.put('/customers', async (ctx, next) => {
	const newCustomer = ctx.request.body;
	const result = await customerService.updateCustomer(newCustomer);
	ctx.body = result;
})

customerRouter.post('/customers', async (ctx, next) => {
	let body = ctx.request.body;
	// console.log("body",JSON.stringify(body));
	const result = await customerService.addCustomer(body.name, body.phone, body.org, body.job);
	ctx.body = result;
})

customerRouter.delete('/customers/:id', async (ctx, next) => {
	let id = ctx.params.id;
	const result = await customerService.removeCustomer(id);
	ctx.body = result;
})
customerRouter.post(
	'/customers/file',
	upload.single('file'),
	async (ctx, next) => {
		const filePath = path.resolve(__dirname, '../../upload_temp','file.xlsx');
		console.log('file path', filePath);
		const rows = await readXlsxFile(fs.createReadStream(filePath));
		const newOrgs = {};
		const newJobs = {};
		for (let i = 1; i < rows.length; i++) {
			const item = rows[i];
			const phone = item[1].toString();
			const existed = await customerService.isCustomerExist(phone);
			newOrgs[item[2]] = item[2];
			newJobs[item[3]] = item[3];
			if (existed) {
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
				await customerService.addCustomer(item[0], phone, item[2], item[3]);
			}
		}
		configurationDAO.updateOrgList(Object.keys(newOrgs));
		configurationDAO.updateJobList(Object.keys(newJobs));
		ctx.body = 'ok';
	}
);

customerRouter.get(
	'/customers/file',
	async (ctx, next) => {
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
			const row = [nameField, phoneField, orgField, jobField];
			data.push(row);
		});
		const xslFilePath = path.resolve(__dirname,'../../download_temp','download.xlsx');
		await writeXlsxFile(data, {
			filePath: xslFilePath
		});
		ctx.set('Content-disposition', 'attachment; filename=' + "download.xlsx");
		ctx.set('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		ctx.body = fs.createReadStream(xslFilePath);

	}
);

export default customerRouter;