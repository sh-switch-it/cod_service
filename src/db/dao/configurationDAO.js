const fs = require('fs');
const path = require('path');
module.exports = {
    getOrgList: () => {
        const filePath = path.resolve(__dirname,'../jsondb','org.json');
        let rawdata = fs.readFileSync(filePath);
        let orgList = JSON.parse(rawdata);
        console.log(orgList);
        return orgList;
    },
    getJobList: ()=> {
        const filePath = path.resolve(__dirname,'../jsondb','job.json');
        let rawdata = fs.readFileSync(filePath);
        let jobList = JSON.parse(rawdata);
        console.log(jobList);
        return jobList;
    },
    getLocationList: ()=> {
        const filePath = path.resolve(__dirname,'../jsondb','location.json');
        let rawdata = fs.readFileSync(filePath);
        let locationList = JSON.parse(rawdata);
        console.log(locationList);
        return locationList;
    },

    getRoleList: ()=> {
        const filePath = path.resolve(__dirname,'../jsondb','role.json');
        let rawdata = fs.readFileSync(filePath);
        let roleList = JSON.parse(rawdata);
        console.log(roleList);
        return roleList;
    },
    //<----------------------------->//
    updateLocationList: (newList, isOverride)=> {
        const filePath = path.resolve(__dirname,'../jsondb','location.json');
        let rawdata = fs.readFileSync(filePath);
        let locationList = JSON.parse(rawdata);
        console.log(locationList);
        return locationList;
    },

    updateOrgList: (newList, isOverride) => {
        let list = [];
        const filePath = path.resolve(__dirname,'../jsondb','org.json');
        if(isOverride){
            list = newList;
        }else{
            let currentList = module.exports.getOrgList();
            list = [...currentList, ...newList];
            list = [...new Set(list)];
        }
        fs.writeFileSync(filePath,JSON.stringify(list));
        return list;
    },
    updateJobList: (newList, isOverride)=> {
        let list = [];
        const filePath = path.resolve(__dirname,'../jsondb','job.json');
        if(isOverride){
            list = newList;
        }else{
            let currentList = module.exports.getJobList();
            list = [...currentList, ...newList];
            list = [...new Set(list)];
        }
        fs.writeFileSync(filePath,JSON.stringify(list));
    },

}
