import { Component, ChangeDetectionStrategy } from '@angular/core';

import { Subscription, EMPTY, BehaviorSubject, Subject } from 'rxjs';

import { Product } from '../product';
import { ProductService } from '../product.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProductListAltComponent {
  pageTitle = 'Products';
  // errorMessage = '';
  selectedProductId = 0;

  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  constructor(private productService: ProductService) { }

  products$ = this.productService.productsWithCategory$
  .pipe(
    catchError(err => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  selectedProduct$ = this.productService.selectedProduct$;

  onSelected(productId: number): void {
    console.log(`Selected Product ID: ${productId}`);
    this.selectedProductId = productId;
    this.productService.selectProduct(productId);
  }
}
