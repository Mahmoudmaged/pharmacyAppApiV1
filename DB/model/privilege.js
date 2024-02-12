import mongoose, { model, Schema, Types } from "mongoose";

const privilegeSchema = new Schema({
    title: { type: String, required: true, unique: true, lowercase: true },
    label: {
        type: String,
        required: true, default: "System",
        enum: [
            "System",
            'Category',
            "Brand",
            "ChronicDisease"
        ]
    },
    // actions: [{
    //     title: { type: String, required: true, unique: true},
    // }],
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
}, {

    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
})


const privilegeModel = mongoose.models.Privilege || model('Privilege', privilegeSchema)
export default privilegeModel




// privilegeSchema.post('find', function (result) {
//     console.log(result);
//     for (let i = 0; i < result.length; i++) {
//         for (let j = 0; j < result[i].actions.length; j++) {
//             result[i].actions[j].displayName = result[i].actions[j].title.replace(/([A-Z])/g, " $1");
//             console.log(result[i].actions[j].displayName );
//         }
//     }
// });
