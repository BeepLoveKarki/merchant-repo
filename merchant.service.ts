import { Injectable } from '@nestjs/common';
import fs from 'fs';
import imageDataURI from 'image-data-uri';
import QRCode from 'qrcode';
import { MERCHANT_PERMISSIONS } from './constants';
import { Merchant } from './merchant.entity';
import {
    ID,
    RoleService,
    patchEntity,
    AssetService,
    CurrencyCode,
    LanguageCode,
    PaginatedList,
    ChannelService,
    RequestContext,
    UserInputError,
    ListQueryBuilder,
    ListQueryOptions,
    AdministratorService,
    isGraphQlErrorResult,
    TransactionalConnection,
} from '@vendure/core';
import {
    DeletionResult,
    CreateRoleInput,
    CreateChannelInput,
    CreateMerchantInput,
    UpdateMerchantInput,
    CreateAdministratorInput,
    UpdateAdministratorInput,
} from '../@codegen/generated-admin-types';

//----------------------------------------------------------------------------------

@Injectable()
export class MerchantService {
    constructor(
        private roleService: RoleService,
        private assetService: AssetService,
        private channelService: ChannelService,
        private listQueryBuilder: ListQueryBuilder,
        private connection: TransactionalConnection,
        private administratorService: AdministratorService,
    ) {}

    async findOne(ctx: RequestContext, merchantId: ID): Promise<Merchant | undefined> {
        return this.connection.getRepository(ctx, Merchant).findOne(merchantId, {
            relations: ['channel', 'role', 'administrator'],
            where: { deletedAt: null },
        });
    }

    async findOneByUuid(ctx: RequestContext, merchantUUID: string): Promise<Merchant | undefined> {
        return this.connection.getRepository(ctx, Merchant).findOne({
            relations: ['channel', 'role', 'administrator'],
            where: { uuid: merchantUUID, deletedAt: null },
        });
    }

    async findOneByChannelId(ctx: RequestContext, channelId: ID): Promise<Merchant | undefined> {
        return this.connection.getRepository(ctx, Merchant).findOne({
            relations: ['channel', 'role', 'administrator'],
            where: { channel: { id: channelId }, deletedAt: null },
        });
    }

    async findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<Merchant>,
    ): Promise<PaginatedList<Merchant>> {
        return this.listQueryBuilder
            .build(Merchant, options, {
                relations: ['channel', 'role', 'administrator'],
                where: { deletedAt: null },
                ctx,
            })
            .getManyAndCount()
            .then(([items, totalItems]) => {
                return {
                    items,
                    totalItems,
                };
            });
    }

    async create(ctx: RequestContext, input: CreateMerchantInput): Promise<Merchant> {
        // Create Channel
        const channelInput: CreateChannelInput = {
            code: input.companyCode,
            token: input.companyCode,
            defaultLanguageCode: LanguageCode.en,
            pricesIncludeTax: false,
            currencyCode: CurrencyCode.SGD,
            defaultTaxZoneId: 1,
            defaultShippingZoneId: 1,
        };
        const newChannel = await this.channelService.create(ctx, channelInput);
        if (isGraphQlErrorResult(newChannel)) {
            throw new UserInputError('error.create-new-channel');
        }
        // Assign Channel to Superadmin
        const superAdminRole = await this.roleService.getSuperAdminRole();
        await this.roleService.assignRoleToChannel(ctx, superAdminRole.id, newChannel.id);
        // Create Role, linked to the created Channel, add Merchant Permissions
        const roleInput: CreateRoleInput = {
            code: input.companyCode,
            description: input.companyCode,
            channelIds: [newChannel.id],
            permissions: MERCHANT_PERMISSIONS,
        };
        const newRole = await this.roleService.create(ctx, roleInput);
        // Create Administrator
        const administratorInput: CreateAdministratorInput = {
            firstName: input.adminFirstName,
            lastName: input.adminLastName,
            emailAddress: input.adminEmail,
            password: input.adminPassword,
            roleIds: [newRole.id],
        };
        // A Merchant is an Administrator with Channel-specific Role
        const newAdministrator = await this.administratorService.create(ctx, administratorInput);

        const repository = this.connection.getRepository(ctx, Merchant);
        let merchant = repository.create({
            ...input,
            channel: newChannel,
            role: newRole,
            administrator: newAdministrator,
        });
        if (input.document) {
            merchant = await this.createDocumentAsset(ctx, input.document, merchant);
        }
        // Save merchant to generte UUID
        merchant = await repository.save(merchant);
        // Generate QR
        const filePath = `${input.companyCode.toLocaleLowerCase().replace(/ /g,"_").replace(/\./g, "")}_QR`;
        const dataUrl = await QRCode.toDataURL(merchant.uuid);
        const output = await imageDataURI.outputFile(dataUrl, filePath);
        const stream = fs.createReadStream(output);
        const qrAsset = await this.assetService.createFromFileStream(stream, ctx);
        fs.unlinkSync(output);
        if (isGraphQlErrorResult(qrAsset)) {
            throw new UserInputError('error.create-new-qr-asset');
        }
        merchant.qrAssetId = Number(qrAsset.id);
        merchant.qrAssetSource = qrAsset.source;
        return repository.save(merchant);
    }

    async update(ctx: RequestContext, input: UpdateMerchantInput): Promise<Merchant> {
        let merchant = await this.findOne(ctx, input.id);
        if (!merchant) {
            throw new Error(`error.merchant-not-found-:${input.id}`);
        }
        const merchantAdminUpdateInput: UpdateAdministratorInput = {
            id: merchant.administrator.id,
        };
        if (input.adminEmail) {
            merchantAdminUpdateInput.emailAddress = input.adminEmail;
        }
        if (input.adminFirstName) {
            merchantAdminUpdateInput.firstName = input.adminFirstName;
        }
        if (input.adminLastName) {
            merchantAdminUpdateInput.lastName = input.adminLastName;
        }
        if (input.adminPassword) {
            merchantAdminUpdateInput.password = input.adminPassword;
        }
        const updatedMerchantAdmin = await this.administratorService.update(ctx, merchantAdminUpdateInput);
        patchEntity(merchant, input);
        merchant.administrator = updatedMerchantAdmin;
        if (input.document) {
            merchant = await this.createDocumentAsset(ctx, input.document, merchant);
        }
        await this.connection.getRepository(ctx, Merchant).save(merchant);
        return merchant;
    }

    async softDelete(ctx: RequestContext, id: ID) {
        const merchant = await this.connection.getEntityOrThrow(ctx, Merchant, id, {
            relations: ['channel', 'role', 'administrator'],
        });
        await this.connection.getRepository(ctx, Merchant).update({ id }, { deletedAt: new Date() });
        await this.administratorService.softDelete(ctx, merchant.administrator.id);
        //await this.channelService.delete(ctx, merchant.channel.id);
        //await this.roleService.delete(ctx, merchant.role.id);
        return {
            result: DeletionResult.DELETED,
        };
    }

    private async createDocumentAsset(
        ctx: RequestContext,
        document: any,
        merchant: Merchant,
    ): Promise<Merchant> {
        const newAsset = await this.assetService.create(ctx, { file: document });
        if (isGraphQlErrorResult(newAsset)) {
            throw new UserInputError('Error creating new document Asset');
        }
        merchant.documentAssetId = Number(newAsset.id);
        merchant.documentAssetSource = newAsset.source;

        return merchant;
    }
}
