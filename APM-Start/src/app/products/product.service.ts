import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError, combineLatest, BehaviorSubject, Subject, merge } from 'rxjs';
import { catchError, tap, map, filter, scan, shareReplay } from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  private productSelectedSubject = new BehaviorSubject(0);
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  private productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private supplierService: SupplierService,
    private productCategoryService: ProductCategoryService
  ) { }

  products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Products: ', JSON.stringify(data))),
      // map(products =>
      //   products.map(product => ({
      //     ...product,
      //     price: product.price * 1.5,
      //     searchKey: [product.productName]
      //   }) as Product)
      // ),
      catchError(err => this.handleError(err))
    );

  productsWithCategory$ = combineLatest(this.products$, this.productCategoryService.productCategories$)
    .pipe(
      map(([products, categories]) =>
        products.map(product => ({
          ...product,
          price: product.price * 1.5,
          searchKey: [product.productName],
          category: [categories.find(e => e.id === product.categoryId).name]
        }))),
        shareReplay(1),
      catchError(err => this.handleError(err))
    );

  productsWithAdd$ = merge(
    this.productsWithCategory$,
    this.productInsertedAction$)
    .pipe(
    scan((acc: Product[], value: Product) => [...acc, value])
    );

  selectedProduct$ = combineLatest([this.productsWithCategory$, this.productSelectedAction$])
    .pipe(
      map(([products, selectedProductId]) =>
        products.find(product => product.id === selectedProductId)),
        shareReplay(1),
      catchError(err => this.handleError(err))
      );

  selectProduct(id: number): void {
    this.productSelectedSubject.next(id);
  }

  addProduct(newProduct: Product) {
    if (newProduct) {
      this.productInsertedSubject.next(newProduct);
    } else {
      this.productInsertedSubject.next(this.fakeProduct());
    }
  }

  private fakeProduct() {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: any) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    return throwError('Danger Will Robinson!');
    // let errorMessage: string;
    // if (err.error instanceof ErrorEvent) {
    //   // A client-side or network error occurred. Handle it accordingly.
    //   errorMessage = `An error occurred: ${err.error.message}`;
    // } else {
    //   // The backend returned an unsuccessful response code.
    //   // The response body may contain clues as to what went wrong,
    //   errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    // }
    // console.error(err);
    // return throwError(errorMessage);
  }

}
