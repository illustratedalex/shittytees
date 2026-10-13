'use client';
import {useEffect} from 'react';
import {useCart} from '@/lib/hooks/useCart';
type Purchased={productId:string;variantId:string;quantity:number};
export default function ClearPurchasedCart({orderId,purchased}:{orderId:string;purchased:Purchased[]}){
 const {items,isHydrated,removeItem,updateQuantity}=useCart();
 useEffect(()=>{
  if(!isHydrated) return;
  const key='shittytees-cart-cleared:'+orderId;
  if(sessionStorage.getItem(key))return;
  sessionStorage.setItem(key,'1');
  for(const bought of purchased){
   const cart=items.find(item=>item.productId===bought.productId&&item.variantId===bought.variantId);
   if(!cart)continue;
   const left=cart.quantity-bought.quantity;
   if(left>0)updateQuantity(cart.productId,cart.variantId,left);else removeItem(cart.productId,cart.variantId);
  }
 },[isHydrated,items,orderId,purchased,removeItem,updateQuantity]);
 return null;
}
