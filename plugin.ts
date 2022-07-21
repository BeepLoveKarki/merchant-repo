import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { gql } from 'apollo-server-core';
import fs from 'fs';
import path from 'path';
import { MerchantAdminResolver } from './merchant-admin.resolver';
import { ProductEntityShopResolver } from './merchant-shop.resolver';
import { Merchant } from './merchant.entity';
import { MerchantService } from './merchant.service';

const schemaExtensionAdmin = gql`
    ${fs.readFileSync(path.join(__dirname, './schema-extension.admin.gql')).toString()}
`;

const schemaExtensionShop = gql`
    ${fs.readFileSync(path.join(__dirname, './schema-extension.shop.gql')).toString()}
`;

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [MerchantService],
    entities: [Merchant],
    adminApiExtensions: {
        schema: schemaExtensionAdmin,
        resolvers: [MerchantAdminResolver],
    },
    shopApiExtensions: {
        schema: schemaExtensionShop,
        resolvers: [ProductEntityShopResolver],
    },
})
export class MerchantPlugin {}

