// // const prisma = require('../../../prisma/global');

// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();
// const {expect} = require('chai');

// const{findCompletedPayments,getUser} = require('../userQueries');

// const{generateQR} = require('../../../application/payment/index')

// describe('User Queries',()=>{
//     it('Should Return An Array of Payments Only Completed',async()=>{

//     const payments = await findCompletedPayments(2,new Date());

//     expect(payments).to.be.an('array');
//     });

//     it('Should Be an Object',async()=>{

//         const user = await getUser('7208660193');

//         console.log("USER",user)

//         expect(user).to.be.an('object');

//         expect(user.id).to.be.an('number');

//         expect(user).has.property('username');

//         expect(user.UserRoles).to.be.an('array');


//         // expect(user.UserRoles).to.be.an('array').length.greaterThan(0)


//     });

    


// })


// describe('Payment Cases',()=>{
//     it('Expecting Error to be returned for Invalid Loan Number',async()=>{

//     const payments = await generateQR('ll').catch(e => e);
    
//     expect(payments).to.have.property('message').include('Invalid Loan')
//     });

    


// })


