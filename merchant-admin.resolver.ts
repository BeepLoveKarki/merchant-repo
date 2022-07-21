import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Merchant } from './merchant.entity';
import { MerchantService } from './merchant.service';
import {
    DeletionResponse,
    QueryMerchantArgs,
    QueryMerchantsArgs,
    QueryMerchantByUuidArgs,
    MutationCreateMerchantArgs,
    MutationDeleteMerchantArgs,
    MutationUpdateMerchantArgs,
    QueryMerchantByChannelIdArgs,
} from '../@codegen/generated-admin-types';
import {
    Ctx,
    Allow,
    Permission,
    Transaction,
    OrderService,
    PaginatedList,
    RequestContext,
} from '@vendure/core';

@Resolver('Merchant')
export class MerchantAdminResolver {
    constructor(private orderService: OrderService, private merchantService: MerchantService) {}

    @Query()
    @Allow(Permission.ReadAdministrator, Permission.ReadChannel)
    async merchant(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryMerchantArgs,
    ): Promise<Merchant | undefined> {
        return this.merchantService.findOne(ctx, args.id);
    }

    @Query()
    @Allow(Permission.ReadAdministrator, Permission.ReadChannel)
    async merchants(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryMerchantsArgs,
    ): Promise<PaginatedList<Merchant>> {
        return this.merchantService.findAll(ctx, args.options || undefined);
    }

    @Query()
    @Allow(Permission.ReadAdministrator, Permission.ReadChannel)
    async merchantByUuid(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryMerchantByUuidArgs,
    ): Promise<Merchant | undefined> {
        return this.merchantService.findOneByUuid(ctx, args.uuid);
    }

    @Query()
    @Allow(Permission.ReadAdministrator, Permission.ReadChannel)
    async merchantByChannelId(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryMerchantByChannelIdArgs,
    ): Promise<Merchant | undefined> {
        return this.merchantService.findOneByChannelId(ctx, args.id);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.CreateAdministrator, Permission.CreateChannel)
    async createMerchant(
        @Ctx() ctx: RequestContext,
        @Args() args: MutationCreateMerchantArgs,
    ): Promise<Merchant> {
        return this.merchantService.create(ctx, args.input);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.UpdateAdministrator, Permission.UpdateChannel)
    async updateMerchant(
        @Ctx() ctx: RequestContext,
        @Args() args: MutationUpdateMerchantArgs,
    ): Promise<Merchant> {
        return this.merchantService.update(ctx, args.input);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.DeleteAdministrator, Permission.DeleteChannel)
    async deleteMerchant(
        @Ctx() ctx: RequestContext,
        @Args() args: MutationDeleteMerchantArgs,
    ): Promise<DeletionResponse> {
        return this.merchantService.softDelete(ctx, args.id);
    }
}
