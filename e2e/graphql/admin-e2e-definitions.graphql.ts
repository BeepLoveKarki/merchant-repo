import gql from 'graphql-tag';
import { MERCHANT_FRAGMENT, PRODUCT_ADMIN_FRAGMENT } from './fragments-e2e-definitions.graphql'

export const GET_MERCHANTS = gql`
  query Merchants($options:MerchantListOptions){
    merchants(options:$options){
        items{
          ...Merchant
        }
        totalItems
    }
}
${MERCHANT_FRAGMENT}
`

export const GET_MERCHANT = gql`
  query Merchant($id: ID!){
    merchant(id: $id){
      ...Merchant
    }
}
${MERCHANT_FRAGMENT}
`

export const GET_MERCHANT_BY_UUID = gql`
  query MerchantByUuid($uuid: String!){
    merchantByUuid(uuid: $uuid){
      ...Merchant
    }
}
${MERCHANT_FRAGMENT}
`

export const GET_MERCHANT_BY_CHANNEL_ID = gql`
  query MerchantByChannelId($id: ID!){
    merchantByChannelId(id: $id){
      ...Merchant
    }
}
${MERCHANT_FRAGMENT}
`

export const CREATE_MERCHANT = gql`
   mutation CreateMechant($input:CreateMerchantInput!){
    createMerchant(input:$input){
      ...Merchant
    }
   }
   ${MERCHANT_FRAGMENT}
`

export const UDPATE_MERCHANT = gql`
   mutation UpdateMechant($input:UpdateMerchantInput!){
    updateMerchant(input:$input){
      ...Merchant
    }
   }
   ${MERCHANT_FRAGMENT}
`

export const DELETE_MERCHANT = gql`
  mutation DeleteMerchant($id:ID!){
  deleteMerchant(id:$id){
    result
    message
  }
}
`

export const ASSIGN_PRODUCTS_TO_CHANNEL = gql`
 mutation AssignProductsToChannel($input:AssignProductsToChannelInput!){
  assignProductsToChannel(input:$input){
    ...ProductAdmin
  }
 }
 ${PRODUCT_ADMIN_FRAGMENT}
 `