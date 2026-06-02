import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { API } from '../lib/api';

export const SellerShops = () => {
  const { token } = useAuth();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', address: '', phone: '', image_url: '' });
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', address: '', phone: '', image_url: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const fetchShops = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/seller/shops`, { headers: { Authorization: `Bearer ${token}` } });
      setShops(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // client-side validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or smaller');
      return;
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setForm({ ...form, image_url: '' });
    try {
      setUploading(true);
      const data = new FormData();
      data.append('file', file);
      const res = await axios.post(`${API}/seller/shops/upload`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ ...form, image_url: res.data.url });
      setPreviewUrl('');
      toast.success('Image uploaded');
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.detail || err.message || 'Upload failed';
      toast.error(`Upload failed: ${msg}`);
    } finally {
      setUploading(false);
    }
  };

  const handleEditImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or smaller');
      return;
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setEditForm({ ...editForm, image_url: '' });
    try {
      setUploading(true);
      const data = new FormData();
      data.append('file', file);
      const res = await axios.post(`${API}/seller/shops/upload`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditForm({ ...editForm, image_url: res.data.url });
      setPreviewUrl('');
      toast.success('Image uploaded');
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.detail || err.message || 'Upload failed';
      toast.error(`Upload failed: ${msg}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteShop = async (shopId) => {
    if (!window.confirm('Are you sure you want to delete this shop? This will remove the shop and unassign its products.')) return;
    try {
      await axios.delete(`${API}/seller/shops/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Shop deleted');
      setShops(shops.filter((shop) => shop.id !== shopId));
    } catch (err) {
      console.error('Error deleting shop', err);
      toast.error(err.response?.data?.detail || 'Failed to delete shop');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.address || !form.phone) {
      toast.error('Please provide shop address and contact phone');
      return;
    }
    try {
      await axios.post(`${API}/seller/shops`, form, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Shop created');
      setForm({ name: '', address: '', phone: '', image_url: '' });
      fetchShops();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to create shop');
    }
  };

  const handleEditClick = (shop) => {
    setEditingId(shop.id);
    setEditForm({ name: shop.name || '', address: shop.address || '', phone: shop.phone || '', image_url: shop.image_url || '' });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    if (!editForm.address || !editForm.phone) {
      toast.error('Address and phone are required');
      return;
    }
    try {
      setSavingEdit(true);
      await axios.put(`${API}/seller/shops/${editingId}`, editForm, { headers: { Authorization: `Bearer ${token}` } });
      setShops(shops.map(s => s.id === editingId ? { ...s, ...editForm } : s));
      toast.success('Shop updated');
      setEditingId(null);
    } catch (err) {
      console.error('Error updating shop', err);
      toast.error(err.response?.data?.detail || 'Failed to update shop');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">My Shops</h1>
        <div className="bg-white p-6 rounded-lg border mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="name">Shop Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="phone">Contact Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div>
              <Label>Shop Image</Label>
              <div className="flex items-center space-x-2">
                <Input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Image URL or upload below" />
                <input type="file" accept="image/*" onChange={handleImage} />
              </div>
              {uploading && <p className="text-sm text-slate-500">Uploading...</p>}
              {(previewUrl || form.image_url) && (
                <img
                  src={previewUrl || form.image_url}
                  alt="shop"
                  className="mt-2 h-28 w-28 rounded-full object-cover"
                />
              )}
            </div>
            <Button type="submit">Create Shop</Button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shops.map((shop) => (
            <div key={shop.id} className="bg-white p-4 rounded-lg border">
              {editingId === shop.id ? (
                <form onSubmit={handleSaveEdit} className="space-y-3">
                  <div>
                    <Label htmlFor="edit-name">Name</Label>
                    <Input id="edit-name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="edit-address">Address</Label>
                    <Input id="edit-address" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="edit-phone">Contact Phone</Label>
                    <Input id="edit-phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="edit-image">Image URL</Label>
                    <Input id="edit-image" value={editForm.image_url} onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-image-file">Replace Image</Label>
                    <input id="edit-image-file" type="file" accept="image/*" onChange={handleEditImage} />
                  </div>
                  <div className="flex items-center gap-3">
                    {(previewUrl || editForm.image_url) && (
                      <img
                        src={previewUrl || editForm.image_url}
                        alt="shop preview"
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={savingEdit}>{savingEdit ? 'Saving...' : 'Save'}</Button>
                    <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center space-x-4">
                  <img src={shop.image_url || 'https://via.placeholder.com/100'} alt={shop.name} className="w-24 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{shop.name}</h3>
                    <p className="text-sm text-slate-600">{shop.id.slice(0,8)}</p>
                  </div>
                  <div className="flex-shrink-0 space-x-2">
                    <Button onClick={() => handleEditClick(shop)} size="sm">Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteShop(shop.id)}>Delete</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
