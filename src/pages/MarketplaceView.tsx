import React, { useState, useEffect } from 'react';
import { ShoppingBag, Coins, Star, Download, Receipt, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { MarketplaceProduct, MarketplaceOrder } from '../types';
import { useAuth } from '../context/AuthContext';
import { soundFX } from '../utils/audio';

export const MarketplaceView: React.FC = () => {
  const { user, setCoins, showToast } = useAuth();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [tab, setTab] = useState<'catalog' | 'orders'>('catalog');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [lastInvoice, setLastInvoice] = useState<MarketplaceOrder | null>(null);

  const fetchCatalog = async () => {
    try {
      const [prodRes, ordRes] = await Promise.all([
        api.getMarketplaceProducts(),
        api.getMarketplaceOrders()
      ]);
      setProducts(prodRes.products || []);
      setOrders(ordRes.orders || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleBuy = async (prod: MarketplaceProduct) => {
    if (!user) {
      showToast('Please sign in to make a purchase', 'error');
      return;
    }
    if (user.coins < prod.priceCoins) {
      showToast(`Insufficient coins! You need ${prod.priceCoins} coins, but have ${user.coins}. Complete Pomodoro sessions and tasks to earn coins!`, 'error');
      return;
    }

    setPurchasingId(prod.id);
    try {
      const res = await api.checkoutProduct(prod.id);
      setCoins(res.remainingCoins);
      setLastInvoice(res.order);
      setOrders([res.order, ...orders]);
      soundFX.playCoin();
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast(`Purchase successful! Invoice #${res.order.invoiceNumber} created.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Checkout failed', 'error');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Verified Student Resources &amp; Productivity Store</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-600" />
            <span>StudyGen Academic Marketplace</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Spend your earned Productivity Coins on verified revision packs, engineering cheatsheets, and student templates.
          </p>
        </div>

        {/* User coins badge */}
        <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-500 fill-current" />
          <div>
            <span className="text-[10px] text-amber-800 uppercase font-bold block">Your Balance</span>
            <span className="text-base font-bold font-mono text-amber-950 tabular-nums">
              {user?.coins || 0} Coins
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('catalog')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            tab === 'catalog'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Catalog Products ({products.length})
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            tab === 'orders'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Order Invoices &amp; Receipts ({orders.length})
        </button>
      </div>

      {/* Last Invoice Modal/Notification if generated */}
      {lastInvoice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-emerald-950">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Order Confirmed! Invoice #{lastInvoice.invoiceNumber}</span>
              <p className="text-[11px] text-emerald-700">
                Purchased: {lastInvoice.productTitle} for {lastInvoice.coinsPaid} Coins.
              </p>
            </div>
          </div>
          <button
            onClick={() => setLastInvoice(null)}
            className="text-xs text-emerald-800 hover:underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {tab === 'catalog' ? (
        /* Catalog Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((prod) => {
            const alreadyBought = orders.some(o => o.productId === prod.id);

            return (
              <div
                key={prod.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-indigo-50 text-indigo-700 font-mono">
                      {prod.category}
                    </span>
                    {prod.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-amber-100 text-amber-800">
                        {prod.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">
                    {prod.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {prod.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      {prod.rating}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3 text-slate-400" />
                      {prod.downloads} downloads
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-sm font-bold font-mono text-slate-900">
                    <Coins className="w-4 h-4 text-amber-500 fill-current" />
                    <span>{prod.priceCoins} Coins</span>
                  </div>

                  {alreadyBought ? (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Purchased</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuy(prod)}
                      disabled={purchasingId === prod.id}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <span>Buy Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Orders & Receipts */
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          {orders.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {orders.map((ord) => (
                <div key={ord.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{ord.productTitle}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Invoice: {ord.invoiceNumber} · {new Date(ord.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-600 flex items-center gap-1 justify-end">
                      <Coins className="w-3.5 h-3.5 fill-current" />
                      -{ord.coinsPaid} Coins
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold uppercase">
                      Paid &amp; Delivered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              No orders yet. Earn coins and purchase your first study template from the catalog!
            </div>
          )}
        </div>
      )}

    </div>
  );
};
