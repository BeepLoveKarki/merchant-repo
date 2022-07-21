import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Ctx, Product, ProductService, RequestContext } from '@vendure/core';
import { MerchantService } from './merchant.service';

@Resolver('Product')
export class ProductEntityShopResolver {
    constructor(private productService: ProductService, private merchantService: MerchantService) {}

    @ResolveField()
    async merchant(@Ctx() ctx: RequestContext, @Parent() product: Product) {
        const productChannels = await this.productService.getProductChannels(ctx, product.id);
        const assignedChannels = productChannels.filter(channel => channel.id !== 1);
        //auto solved by assignProductsToChannel override
        /*if (assignedChannels.length > 1) {
            throw new Error('error.more-than-one-merchant-channel-assigned-to-product');
        }*/
        if (assignedChannels.length === 0) {
            return null;
        }
        const channel = assignedChannels[0];
        const merchant = await this.merchantService.findOneByChannelId(ctx, channel.id);
        if (!merchant) {
            return null;
        }
        const {
            companyName,
            companyAddress,
            companyDescription,
            customerContactEmail,
            customerContactPhone,
        } = merchant;
        return {
            companyName,
            companyAddress,
            companyDescription,
            customerContactEmail,
            customerContactPhone,
        };
    }
}
