import { GraphQLFloat, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql"
import { imageType } from "../../product/GraphQl/types.js"



export const brandType = new GraphQLObjectType({
    name: "brandType",
    description: "",
    fields: {
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        image: { type: imageType('brandImage') },
    }
})