import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API } from '../lib/api';
import { Button } from '../components/ui/button';
import { Package } from 'lucide-react';

export const ShopList = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/shops`);
      setShops(res.data || []);
    } catch (err) {
      console.error('Error fetching shops', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">Browse Shops</p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Find your favorite local store</h1>
            <p className="mt-3 text-slate-600 max-w-2xl">Explore shops by category, click into a store, and view only the products that belong to that seller.</p>
          </div>
          <Link to="/" className="inline-flex">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Package className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : shops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Link key={shop.id} to={`/shops/${shop.id}`} className="block rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md overflow-hidden">
                <div className="h-52 overflow-hidden">
                  <img src={shop.image_url || 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350&w=700'} alt={shop.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-slate-900">{shop.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">By {shop.seller_name || 'Local Seller'}</p>
                  {shop.phone && <p className="mt-1 text-sm text-slate-600">Contact: {shop.phone}</p>}
                  {shop.address && <p className="mt-1 text-sm text-slate-600 line-clamp-2">{shop.address}</p>}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-slate-600">{shop.product_count ?? 0} products available</span>
                    <Button size="sm">Visit Shop</Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-slate-600">No shops available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
