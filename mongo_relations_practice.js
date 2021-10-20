// one to one relations part 1 
//  hitesh



// > db.persons.insertOne({
// ... name: "Tahir",
// ... isVerified: true,
// ... earning: 3000
// ... })
// {
//         "acknowledged" : true,
//         "insertedId" : ObjectId("616bbae4962cdccbbef7914c")
// }
// > db.videos.insertOne({
// ... topic: "funOne",
// ... length: 4,
// ... creator: ObjectId("616bbae4962cdccbbef7914c")
// ... })
// {
//         "acknowledged" : true,
//         "insertedId" : ObjectId("616bbb97962cdccbbef7914d")
// }
// > db.videos.findOne()
// {
//         "_id" : ObjectId("616bbb97962cdccbbef7914d"),
//         "topic" : "funOne",
//         "length" : 4,
//         "creator" : ObjectId("616bbae4962cdccbbef7914c")
// }



// one to one relations part 2



