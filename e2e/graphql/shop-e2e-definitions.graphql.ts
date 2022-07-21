import gql from 'graphql-tag';
import { PRODUCT_SHOP_FRAGMENT } from './fragments-e2e-definitions.graphql'

export const GET_A_PRODUCT = gql`
  query Product($id:ID!){
    product(id:$id){
      ...ProductShop
    }
}
${PRODUCT_SHOP_FRAGMENT}
`
