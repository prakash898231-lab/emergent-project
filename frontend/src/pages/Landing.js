import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Package } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { API } from '../lib/api';

export const Landing = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState([]);
  const [shopsLoading, setShopsLoading] = useState(true);

  const categories = ['all', 'Electronics', 'Fashion', 'Home', 'Groceries', 'Books', 'Other'];

  useEffect(() => {
    fetchProducts();
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setShopsLoading(true);
      const res = await axios.get(`${API}/shops`);
      setShops(res.data || []);
    } catch (err) {
      console.error('Error fetching shops', err);
    } finally {
      setShopsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = products;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-24" data-testid="hero-section">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <motion.div
              className="md:col-span-7"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Shop Local,<br />Support Your Community
              </h1>
              <p className="text-lg leading-relaxed text-slate-600 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                Discover fresh products from local sellers in your neighborhood. Quality goods, delivered with care.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex-1 max-w-md relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                    data-testid="search-input"
                  />
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#products">
                  <Button className="rounded-full">Browse Products</Button>
                </a>
                <Link to="/shops">
                  <Button variant="outline" className="rounded-full">Browse Shops</Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              className="md:col-span-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img
                src="https://images.pexels.com/photos/6591159/pexels-photo-6591159.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                alt="Fresh grocery delivery"
                className="rounded-xl shadow-lg w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white" data-testid="shops-section">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <h2 className="text-2xl font-semibold mb-4">Local Shops</h2>
          {shopsLoading ? (
            <div className="py-6">Loading shops...</div>
          ) : shops.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {shops.map((shop) => (
                <Link key={shop.id} to={`/shops/${shop.id}`} className="w-56 flex-shrink-0 bg-white rounded-lg p-4 border hover:shadow">
                  <img src={shop.image_url || 'https://via.placeholder.com/300x200'} alt={shop.name} className="w-full h-32 object-cover rounded mb-2" />
                  <h3 className="text-lg font-semibold">{shop.name}</h3>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-600">No shops available yet</p>
          )}
        </div>
      </section>

      <section className="py-12 bg-white" data-testid="categories-section">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center space-x-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                className="rounded-full whitespace-nowrap"
                data-testid={`category-${cat}`}
              >
                {cat === 'all' ? 'All Products' : cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-slate-50" data-testid="products-section">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {loading ? (
            <div className="flex justify-center items-center py-20" data-testid="loading">
              <Package className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20" data-testid="no-products">
              <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
              <p className="text-slate-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};