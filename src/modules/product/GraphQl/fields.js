import { GraphQLEnumType, GraphQLFloat, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql"
import productModel from "../../../../DB/model/Product.model.js"
import { productType } from "./types.js"
import { graphValidation } from "../../../middleware/validation.js"
import * as validators from '../product.validation.js'
import { graphAuth, roles } from "../../../middleware/auth.js"


export const products = {
    type: new GraphQLList(productType),
    resolve: async () => {
        const products = await productModel.find({}).populate([
            { path: "brandId" }
        ])
        return products
    }
}

export const productById = {
    type: productType,
    args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
    },
    resolve: async (parent, args) => {
        const product = await productModel.findById(args.id);
        return product
    }
}

export const updateStock = {
    type: productType,
    args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        stock: { type: new GraphQLNonNull(GraphQLInt) },
        authorization: { type: new GraphQLNonNull(GraphQLString) }
    },
    resolve: async (parent, args) => {
        // validation
        await graphValidation(validators.updateStock, args)
        //auth
        const authUser = await graphAuth(args.authorization, [roles.Admin])
        const { id, stock } = args;
        const product = await productModel.findByIdAndUpdate({ _id: id }, { stock, updatedBy: authUser._id }, { new: true })
        console.log(product);
        return product
    }
}

export const deleteByID = {
    type: productType,
    args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
    },
    resolve: async (parent, { id }) => {
        const product = await productModel.findByIdAndDelete(id)
        return product
    }
}