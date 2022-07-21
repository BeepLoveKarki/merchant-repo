/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { 
    createTestEnvironment, 
    registerInitializer, 
    SqljsInitializer,
    MysqlInitializer,
    PostgresInitializer, } from '@vendure/testing';
import path from 'path';
import { mergeConfig } from '@vendure/core';
//import { omit } from '@vendure/common/lib/omit';
//import { pick } from '@vendure/common/lib/pick';
import { MerchantPlugin } from '../plugin';
import { initialData } from './config/e2e-initial-data';
import { TEST_SETUP_TIMEOUT_MS, testConfig } from './config/test-config';
import {
    GET_MERCHANTS,
    GET_MERCHANT,
    CREATE_MERCHANT,
    UDPATE_MERCHANT,
    DELETE_MERCHANT,
    GET_MERCHANT_BY_UUID,
    GET_MERCHANT_BY_CHANNEL_ID,
    ASSIGN_PRODUCTS_TO_CHANNEL
} from './graphql/admin-e2e-definitions.graphql';
import { GET_A_PRODUCT } from './graphql/shop-e2e-definitions.graphql';

registerInitializer('sqljs', new SqljsInitializer(path.join(__dirname, '__data__')));
registerInitializer('postgres', new PostgresInitializer());
registerInitializer('mysql', new MysqlInitializer());

//jest.useRealTimers();

describe('merchant plugin', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { server, adminClient, shopClient } = createTestEnvironment(
        mergeConfig(testConfig, {
            assetOptions: {
                permittedFileTypes: ['image/*', '.pdf', '.zip', '.txt'],
            },
            plugins: [MerchantPlugin],
        }),
        //plugins: [MerchantPlugin],
    );

    let merchantUUID: string;
    let merchantChannelID: string;

    beforeAll(async () => {
        await server.init({
            initialData,
            productsCsvPath: path.join(__dirname, 'config/e2e-products.csv'),
            //customerCount: 1,
        });
        //await adminClient.asSuperAdmin();
    }, TEST_SETUP_TIMEOUT_MS);

    afterAll(async () => {
        await server.destroy();
    });

    it('create a merchant', async () => {
        await adminClient.asSuperAdmin();
        const newMerchant = await createMerchant() as any;
        const merchant = formatMerch(newMerchant);
        expect(merchant).toEqual({
            id: 'T_1',
            companyCode: 'MENZZ',
            companyName: 'Menzz Co. Ltd.',
            companyAddress: 'Kirtipur-2, Kathmandu',
            companyDescription: "All about men's grooming",
            customerContactEmail: 'info@menzz.co',
            customerContactPhone: '9840260599',
            adminPhoneNumber: '9843437928'
        });
    });

    it('get all merchants', async () => {
        await adminClient.asSuperAdmin();
        const allMerchants = await getAllMerchants() as any;
        expect(allMerchants.totalItems).toEqual(1);

        const firstMerchant = formatMerch(allMerchants.items[0]);
        expect(firstMerchant).toEqual({
            id: 'T_1',
            companyCode: 'MENZZ',
            companyName: 'Menzz Co. Ltd.',
            companyAddress: 'Kirtipur-2, Kathmandu',
            companyDescription: "All about men's grooming",
            customerContactEmail: 'info@menzz.co',
            customerContactPhone: '9840260599',
            adminPhoneNumber: '9843437928'
        });
    });

    it('get a merchant', async () => {
        await adminClient.asSuperAdmin();
        const merch = formatMerch(await getMerchant('T_1') as any);
        expect(merch).toEqual({
            id: 'T_1',
            companyCode: 'MENZZ',
            companyName: 'Menzz Co. Ltd.',
            companyAddress: 'Kirtipur-2, Kathmandu',
            companyDescription: "All about men's grooming",
            customerContactEmail: 'info@menzz.co',
            customerContactPhone: '9840260599',
            adminPhoneNumber: '9843437928'
        });
    });

    it('get a merchant by uuid', async () => {
        await adminClient.asSuperAdmin();
        const merch = formatMerch(await getMerchantByUUID() as any);
        expect(merch).toEqual({
            id: 'T_1',
            companyCode: 'MENZZ',
            companyName: 'Menzz Co. Ltd.',
            companyAddress: 'Kirtipur-2, Kathmandu',
            companyDescription: "All about men's grooming",
            customerContactEmail: 'info@menzz.co',
            customerContactPhone: '9840260599',
            adminPhoneNumber: '9843437928'
        });
    });

    it('get a merchant by channel id', async () => {
        await adminClient.asSuperAdmin();
        const merch = formatMerch(await getMerchantByChannelId() as any);
        expect(merch).toEqual({
            id: 'T_1',
            companyCode: 'MENZZ',
            companyName: 'Menzz Co. Ltd.',
            companyAddress: 'Kirtipur-2, Kathmandu',
            companyDescription: "All about men's grooming",
            customerContactEmail: 'info@menzz.co',
            customerContactPhone: '9840260599',
            adminPhoneNumber: '9843437928'
        });
    });

    it('update a merchant', async () => {
        await adminClient.asSuperAdmin();
        const merch = formatMerch(await updateMerchant('T_1') as any);
        expect(merch).toEqual({
            id: 'T_1',
            companyCode: 'MENZZ Company',
            companyName: 'Menzz Co. Ltd.',
            companyAddress: 'Kirtipur-2, Kathmandu',
            companyDescription: "All about men's grooming",
            customerContactEmail: 'info@menzz.co',
            customerContactPhone: '9840260599',
            adminPhoneNumber: '9843437928'
        });
    });

    it('assign a product to merchant', async () =>{
        await adminClient.asSuperAdmin();
        const prod = await assignMerchant() as any;
        expect(prod.channels[1].code).toEqual('MENZZ');
    })

    it('get a product with merchant details', async () => {
        const prod = await getAProduct("T_1") as any;
        expect(prod.merchant).toEqual({
            companyName: 'Menzz Co. Ltd.',
            companyAddress: 'Kirtipur-2, Kathmandu',
            companyDescription: "All about men's grooming",
            customerContactEmail: 'info@menzz.co',
            customerContactPhone: '9840260599'
        })
    });

    it('delete a merchant', async () => {
        await adminClient.asSuperAdmin();
        expect(await deleteMerchant('T_1')).toEqual('DELETED');
    });

    it('get a product after merchant delete', async () => {
        const prod = await getAProduct("T_1") as any;
        expect(prod.merchant).toEqual(null);
    });

    function formatMerch(merchant:any){
        const merchKeys = [
            "id",
            "companyCode",
            "companyName",
            "companyAddress",
            "companyDescription",
            "customerContactEmail",
            "customerContactPhone",
            "adminPhoneNumber"
        ]
        const merch = {} as any;
        Object.keys(merchant).forEach((value)=>{
            if(merchKeys.indexOf(value)!=-1){
                merch[value]=merchant[value]
            }
        })
        return merch;
    }

    async function getAllMerchants() {
        const getAllIt = await adminClient.query(GET_MERCHANTS, {
            options: {
                sort: {
                    id: "ASC",
                },
            },
        });
        return getAllIt.merchants;
    }

    async function getAProduct(id:string) {
        const getAllIt = await shopClient.query(GET_A_PRODUCT, {id});
        return getAllIt.product;
    }

    async function getMerchant(id: string) {
        const getIt = await adminClient.query(GET_MERCHANT, { id });
        return getIt.merchant;
    }

    async function getMerchantByUUID() {
        const getIt = await adminClient.query(GET_MERCHANT_BY_UUID, {
            uuid: merchantUUID,
        });
        return getIt.merchantByUuid;
    }

    async function getMerchantByChannelId() {
        const getIt = await adminClient.query(GET_MERCHANT_BY_CHANNEL_ID, {
            id: merchantChannelID,
        });
        return getIt.merchantByChannelId;
    }

    async function createMerchant() {
        /*const createdIt = await adminClient.query(CREATE_MERCHANT, {
            input: {
                adminFirstName: 'Biplab',
                adminLastName: 'Karki',
                adminEmail: 'biplab@menzz.co',
                adminPassword: 'Meriaama1234#',
                adminPhoneNumber: '9843437928',
                companyCode: 'MENZZ',
                companyName: 'Menzz Co. Ltd.',
                companyAddress: 'Kirtipur-2, Kathmandu',
                companyDescription: "All about men's grooming",
                customerContactEmail: 'info@menzz.co',
                customerContactPhone: '9840260599',
                enabled: true,
            },
        });*/

        const filesToUpload = [
            path.join(__dirname, 'fixtures/assets/dummy.txt'),
        ];

        console.log(filesToUpload);

        const createdIt = await adminClient.fileUploadMutation({
            mutation:CREATE_MERCHANT,
            filePaths: filesToUpload,
            mapVariables: filePaths => ({
                input: {
                    adminFirstName: "Biplab",
                    adminLastName: "Karki",
                    adminEmail: "biplab@menzz.co",
                    adminPassword: "Meriaama1234#",
                    adminPhoneNumber: "9843437928",
                    companyCode:"MENZZ",
                    companyName: "Menzz Co. Ltd.",
                    companyAddress: "Kirtipur-2, Kathmandu",
                    companyDescription: "All about men's grooming",
                    customerContactEmail:"info@menzz.co",
                    customerContactPhone:"9840260599",
                    enabled: true,
                    document: filePaths.map(() => ({ file:null })),
                }
            }),
        })

        console.log(createdIt);

        merchantUUID = createdIt.createMerchant!.uuid;
        merchantChannelID = createdIt.createMerchant.channel.id;

        return createdIt.createMerchant;
    }

    async function assignMerchant() {
        const assignedIt = await adminClient.query(ASSIGN_PRODUCTS_TO_CHANNEL, {
            input: {
                productIds:["T_1"],
                channelId: merchantChannelID
            },
        });
        return assignedIt.assignProductsToChannel[0];
    }


    async function updateMerchant(id: string) {
        const updatedIt = await adminClient.query(UDPATE_MERCHANT, {
            input: {
                id: id,
                adminFirstName: 'Biplab',
                adminLastName: 'Karki',
                adminEmail: 'biplab@menzz.co',
                adminPassword: 'Meriaama1234#',
                adminPhoneNumber: '9843437928',
                companyCode: 'MENZZ Company',
                companyName: 'Menzz Co. Ltd.',
                companyAddress: 'Kirtipur-2, Kathmandu',
                companyDescription: "All about men's grooming",
                customerContactEmail: 'info@menzz.co',
                customerContactPhone: '9840260599',
                enabled: true,
            },
        });

        return updatedIt.updateMerchant;
    }

    async function deleteMerchant(id: string) {
        const deletedIt = await adminClient.query(DELETE_MERCHANT, {
            id,
        });

        return deletedIt.deleteMerchant.result;

        //return updatedIt.updateMerchant!.id;
    }
});
