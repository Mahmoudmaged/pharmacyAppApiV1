import { GraphQLFloat, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql"
import { brandType } from "../../brand/GraphQL/types.js"
import subcategoryModel from "../../../../DB/model/Subcategory.model.js"

export function imageType(name) {
    return new GraphQLObjectType({
        name: name || "productImage",
        description: "",
        fields: {
            secure_url: { type: GraphQLString },
            publicId: { type: GraphQLString },
        }
    })
}

const customImageType = imageType()


export const productType = new GraphQLObjectType({
    name: "ProductType",
    description: "",
    fields: {
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        slug: { type: GraphQLString },
        price: { type: GraphQLFloat },
        discount: { type: GraphQLFloat },
        finalPrice: { type: GraphQLFloat },
        stock: { type: GraphQLInt },
        colors: { type: new GraphQLList(GraphQLString) },
        size: { type: new GraphQLList(GraphQLString) },
        mainImage: { type: customImageType },
        subImages: { type: new GraphQLList(customImageType) },
        subcategoryId: { type: GraphQLID },
        categoryId: { type: GraphQLID },
        subcategories: {
            type: new GraphQLList(new GraphQLObjectType({
                name: "subcategory",
                description: "",
                fields: {
                    _id: { type: GraphQLID },
                    name: { type: GraphQLString },
                }
            })),
            resolve: async (parent, _) => {
                const subcategories = await subcategoryModel.find({ categoryId: parent.categoryId })
                return subcategories
            }
        },
        brandId: { type: brandType },

    }
})