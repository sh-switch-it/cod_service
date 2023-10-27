import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));

const getOrgList = () => {
  const filePath = path.resolve(__dirname, '../jsondb', 'org.json');
  let rawdata = fs.readFileSync(filePath);
  let orgList = JSON.parse(rawdata);
  console.log(orgList);
  return orgList;
};
const getJobList = () => {
  const filePath = path.resolve(__dirname, '../jsondb', 'job.json');
  let rawdata = fs.readFileSync(filePath);
  let jobList = JSON.parse(rawdata);
  console.log(jobList);
  return jobList;
};
const getLocationList = () => {
  const filePath = path.resolve(__dirname, '../jsondb', 'location.json');
  let rawdata = fs.readFileSync(filePath);
  let locationList = JSON.parse(rawdata);
  console.log(locationList);
  return locationList;
};

const getRoleList = () => {
  const filePath = path.resolve(__dirname, '../jsondb', 'role.json');
  let rawdata = fs.readFileSync(filePath);
  let roleList = JSON.parse(rawdata);
  console.log(roleList);
  return roleList;
};
//<----------------------------->//
const updateLocationList = (newList, isOverride) => {
  const filePath = path.resolve(__dirname, '../jsondb', 'location.json');
  let rawdata = fs.readFileSync(filePath);
  let locationList = JSON.parse(rawdata);
  console.log(locationList);
  return locationList;
};

const updateOrgList = (newList, isOverride) => {
  let list = [];
  const filePath = path.resolve(__dirname, '../jsondb', 'org.json');
  if (isOverride) {
    list = newList;
  } else {
    let currentList = getOrgList();
    list = [...currentList, ...newList];
    list = [...new Set(list)];
  }
  fs.writeFileSync(filePath, JSON.stringify(list));
  return list;
};
const updateJobList = (newList, isOverride) => {
  let list = [];
  const filePath = path.resolve(__dirname, '../jsondb', 'job.json');
  if (isOverride) {
    list = newList;
  } else {
    let currentList = getJobList();
    list = [...currentList, ...newList];
    list = [...new Set(list)];
  }
  fs.writeFileSync(filePath, JSON.stringify(list));
};

export default{
    getOrgList,
    getJobList,
    getLocationList,
    getRoleList,
    updateLocationList,
    updateOrgList,
    updateJobList
}
