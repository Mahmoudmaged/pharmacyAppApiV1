import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import * as productController from './fields.js'

export const productSchema = new GraphQLSchema({

    query: new GraphQLObjectType({
        name: "ProductQuery",
        description: "handel graphQl API inside product module",
        fields: {
            products: productController.products,
            productById: productController.productById
        }
    }),
    mutation: new GraphQLObjectType({
        name:"productMutation",
        description:"jop",
        fields:{
            updateStock: productController.updateStock,
            deleteByID: productController.deleteByID,

        }
    })
}) 