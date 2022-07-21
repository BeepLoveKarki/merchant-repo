import { LanguageCode } from '@vendure/common/lib/generated-types';
import { InitialData } from '@vendure/core';

export const initialData: InitialData = {
    defaultLanguage: LanguageCode.en,
    defaultZone: 'Asia',
    taxRates: [
        { name: 'Standard Tax Asia', percentage: 0 },
    ],
    shippingMethods: [
        { name: 'Standard Shipping', price: 0 },
    ],
    paymentMethods: [],
    countries: [
        { name: 'Singapore', code: 'SG', zone: 'Asia' },
    ],
    collections: [
        {
            name: 'Plants',
            filters: [
                {
                    code: 'facet-value-filter',
                    args: { facetValueNames: ['plants'], containsAny: false },
                },
            ],
        },
    ],
};
