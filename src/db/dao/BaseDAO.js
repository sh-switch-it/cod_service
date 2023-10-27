class BaseDAO {
    constructor(_Model){
        this.Model = _Model;
    }
    async create(modelObject){
        let createdModel;
        try{
            createdModel = await this.Model.create(modelObject)
        }catch(e){
            console.error(e);
        }
        return createdModel;
    }
    async update(id,newModelObject){
        let exists = await this.Model.findByPk(id);
        delete newModelObject['id'];
        let existsModel = Object.assign(exists,newModelObject);
        let updatedModel = await existsModel.save();
        return updatedModel;
    }

    async patchUpdate(id,patchModelObject){
        let exists = await this.Model.findByPk(id);
        Object.keys(patchModelObject).map((key)=>{
            exists.set(key, patchModelObject[key]);
        })
        let result = await exists.save();
        return result;
    }

    async remove(id){
        let existsModel = await this.Model.findByPk(id);
        let result = await existsModel.destroy();
        return result;
    }
    async query(condition,includeAssociation){
        let result = await this.Model.findOne({
            where: condition,
            include: includeAssociation
        },)
        return result;
    }
    async queryAll(condition,sorter,offset,limit){
        let result = await this.Model.findAll({          
            where: condition,
            order: sorter,
            limit: limit,
            offset: offset,
        })
        return result;
    }
}

export default BaseDAO;