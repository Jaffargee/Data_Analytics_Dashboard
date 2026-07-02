import React from 'react';
import { TopProductsCharts } from './TopProductsCharts';
import { ProductsTable } from './ProductsTable';
import type { TopProduct } from '../types';

interface ProductsTabProps {
      products: TopProduct[];
}

export function ProductsTab({ products }: ProductsTabProps) {
      return (
            <>
                  <TopProductsCharts products={products} />
                  <ProductsTable products={products} />
            </>
      );
}
