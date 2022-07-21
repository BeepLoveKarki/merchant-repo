import gql from 'graphql-tag';

export const MERCHANT_FRAGMENT = gql`
    fragment Merchant on Merchant {
        id
        uuid
        createdAt
        updatedAt
        channel {
            id
        }
        role {
            id
        }
        administrator {
            firstName
            lastName
            emailAddress
            id
        }
        companyCode
        companyName
        companyAddress
        companyDescription
        customerContactEmail
        customerContactPhone
        adminPhoneNumber
        qrAssetId
        qrAssetSource
        documentAssetId
        documentAssetSource
        enabled
    }
`;

export const MERCHANT_INFO_FRAGMENT = gql`
    fragment MerchantInfo on MerchantInfo {
        companyName
        companyAddress
        companyDescription
        customerContactEmail
        customerContactPhone
    }
`;

export const PRODUCT_SHOP_FRAGMENT = gql`
  fragment ProductShop on Product{
    id
    name
    merchant{
        ...MerchantInfo
    }
  }
${MERCHANT_INFO_FRAGMENT}
`;

export const PRODUCT_ADMIN_FRAGMENT = gql`
  fragment ProductAdmin on Product{
    id
    name
    channels{
        id
        code
    }
  }
`;
