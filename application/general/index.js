
const {getGenericData,addGenericData} = require('./genericCases')

const generalUseCases = {
    getMany:getGenericData,
    createSingle:addGenericData
}


module.exports = generalUseCases;