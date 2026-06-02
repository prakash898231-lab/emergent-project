import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';
import { API } from '../lib/api';
import { Button } from '../components/ui/button';
import { Package } from 'lucide-react';

export const Shop = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShop();
  }, [id]);

  useEffect(() => {
    if (selectedCategory === 'all') setFiltered(products);
    else setFiltered(products.filter(p => p.category === selectedCategory));
  }, [products, selectedCategory]);

  const fetchShop = async () => {
    try {
      setLoading(true);
      const [sRes, pRes, cRes] = await Promise.all([
        axios.get(`${API}/shops/${id}`),
        axios.get(`${API}/shops/${id}/products`),
        axios.get(`${API}/shops/${id}/categories`),
      ]);

      setShop(sRes.data);
      setProducts(pRes.data || []);
      setFiltered(pRes.data || []);
      const cats = ['all', ...(cRes.data || [])];
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching shop', err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Package className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!shop) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="mb-6">
          <Link to="/shops">
            <Button variant="ghost" className="mb-4">&larr; Back to All Shops</Button>
          </Link>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] items-center">
              <img src={shop.image_url || 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350&w=350'} alt={shop.name} className="w-full h-72 rounded-3xl object-cover" />
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-3">Shop Storefront</p>
                <h1 className="text-4xl font-bold text-slate-900 mb-3">{shop.name}</h1>
                <p className="text-sm text-slate-500 mb-2">By {shop.seller_name || 'Local Seller'}</p>
                <p className="text-sm text-slate-500">{shop.product_count ?? 0} products available</p>
                {shop.address && (
                  <p className="text-sm text-slate-500 mt-2">Address: {shop.address}</p>
                )}
                {shop.phone && (
                  <p className="text-sm text-slate-500">Contact: {shop.phone}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  {categories.map(cat => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(cat)}
                      className="rounded-full whitespace-nowrap"
                    >
                      {cat === 'all' ? 'All Products' : cat}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found in this shop</h3>
            <p className="text-slate-600">Try another shop or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
};
