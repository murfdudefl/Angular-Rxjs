import { Component, ChangeDetectionStrategy } from '@angular/core';

import { Subscription, Observable, EMPTY, BehaviorSubject, combineLatest } from 'rxjs';

import { Product } from './product';
import { ProductService } from './product.service';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';
  categories;
  private selectedCategorySubject = new BehaviorSubject<number>(0);
  selectedCategoryAction$ = this.selectedCategorySubject.asObservable();

  constructor(
    private productService: ProductService,
    private productCategoryService: ProductCategoryService) { }

  // products$ = this.productService.productsWithCategory$
  // .pipe(
  //   catchError(err => {
  //     this.errorMessage = err;
  //     return EMPTY;
  //   })
  // );

  products$ = combineLatest([
    this.productService.productsWithAdd$,
    this.selectedCategoryAction$
  ])
  .pipe(
    map(([products, selectedCategoryId]) =>
      products.filter(product =>
        selectedCategoryId ? product.categoryId === selectedCategoryId : true),
    ),
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  categories$ = this.productCategoryService.productCategories$
  .pipe(
    tap(category => console.log(`Categories: ${JSON.stringify(category)}`)),
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  onAdd(): void {
    this.productService.addProduct(null);
  }

  onSelected(categoryId: string): void {
    console.log(`Selected Category ID: ${categoryId}`);
    this.selectedCategorySubject.next(+categoryId);
    // this.selectedCategoryId = parseInt(categoryId, 10);
  }
}
