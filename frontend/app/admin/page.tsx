'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type ProductImage = {
  id: string;
  type: 'url' | 'file';
  url: string;
  file?: File;
};

// Client-side image compressor using native Canvas API
const compressImage = async (file: File, maxWidth = 1600, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    // If not an image, return original
    if (!file.type.startsWith('image/')) return resolve(file);

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Maintain aspect ratio while bounding to maxWidth
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP format with quality compression
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);

          const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
          const compressedFile = new File([blob], newFileName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => resolve(file);
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'categories' | 'products'>('products');
  const [isProcessing, setIsProcessing] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  // Category State
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  // Product State
  const initialSizes = [{ size: 'S' }, { size: 'M' }, { size: 'L' }];
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ 
    name: '', description: '', price: '', categoryId: '', 
    sizes: initialSizes 
  });
  
  // Unified Image State for Preview & Reordering
  const [productImages, setProductImages] = useState<ProductImage[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setIsAuthChecking(false);
        fetchCategories(); 
        fetchProducts();
      }
    };
    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*, product_sizes(*)');
    if (data) setProducts(data);
  };

  // --- CATEGORY LOGIC ---

  const startEditingCategory = (category: any) => {
    setEditingCategoryId(category.id);
    setCategoryForm({ name: category.name, description: category.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditingCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm({ name: '', description: '' });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (editingCategoryId) {
        const { error } = await supabase.from('categories')
          .update({ name: categoryForm.name, description: categoryForm.description })
          .eq('id', editingCategoryId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories')
          .insert([{ name: categoryForm.name, description: categoryForm.description }]);
        if (error) throw error;
      }
      cancelEditingCategory();
      fetchCategories();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };

  // --- PRODUCT LOGIC ---

  const handleSizeChange = (index: number, value: string) => {
    const updatedSizes = [...newProduct.sizes];
    updatedSizes[index] = { size: value };
    setNewProduct({ ...newProduct, sizes: updatedSizes });
  };

  const removeSize = (index: number) => {
    const updatedSizes = [...newProduct.sizes];
    updatedSizes.splice(index, 1);
    setNewProduct({ ...newProduct, sizes: updatedSizes });
  };

  const startEditingProduct = (product: any) => {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      categoryId: product.category_id,
      sizes: product.product_sizes.length > 0 ? product.product_sizes.map((s: any) => ({ size: s.size })) : initialSizes
    });
    
    // Map existing DB URLs to our unified state
    const existingImgs = (product.images || []).map((url: string) => ({
      id: Math.random().toString(),
      type: 'url' as const,
      url
    }));
    setProductImages(existingImgs);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditingProduct = () => {
    setEditingProductId(null);
    setNewProduct({ name: '', description: '', price: '', categoryId: '', sizes: initialSizes });
    setProductImages([]);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    await supabase.from('product_sizes').delete().eq('product_id', id);
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  };

  // --- IMAGE MANAGEMENT LOGIC ---

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Automatically compress all selected images concurrently
    const compressedFiles = await Promise.all(
      files.map((file) => compressImage(file))
    );

    const newImgs = compressedFiles.map((file) => ({
      id: Math.random().toString(),
      type: 'file' as const,
      url: URL.createObjectURL(file), // Generates instant local preview
      file,
    }));

    setProductImages((prev) => [...prev, ...newImgs]);
    e.target.value = ''; // Reset input
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newArr = [...productImages];
    if (direction === 'left' && index > 0) {
      [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
    } else if (direction === 'right' && index < newArr.length - 1) {
      [newArr[index + 1], newArr[index]] = [newArr[index], newArr[index + 1]];
    }
    setProductImages(newArr);
  };

  const removeImage = (index: number) => {
    const newArr = [...productImages];
    newArr.splice(index, 1);
    setProductImages(newArr);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.categoryId) return alert("Please select a category");
    setIsProcessing(true);

    try {
      let finalImageUrls: string[] = [];
      
      // Process images in their specific ordered arrangement
      for (const img of productImages) {
        if (img.type === 'url') {
          // Already uploaded, just keep the URL
          finalImageUrls.push(img.url);
        } else if (img.type === 'file' && img.file) {
          // New file, needs uploading
          const fileExt = img.file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage.from('product-images').upload(`products/${fileName}`, img.file);
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(`products/${fileName}`);
          finalImageUrls.push(publicUrl);
        }
      }

      let productId = editingProductId;

      if (editingProductId) {
        await supabase.from('products').update({
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          category_id: newProduct.categoryId,
          images: finalImageUrls
        }).eq('id', editingProductId);

        await supabase.from('product_sizes').delete().eq('product_id', editingProductId);
      } else {
        const { data: productData, error: productError } = await supabase.from('products').insert([{
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          category_id: newProduct.categoryId,
          images: finalImageUrls
        }]).select().single();

        if (productError) throw productError;
        productId = productData.id;
      }

      const sizesToInsert = newProduct.sizes.map(s => ({
        product_id: productId,
        size: s.size,
        stock: 999 
      }));

      await supabase.from('product_sizes').insert(sizesToInsert);

      alert(editingProductId ? 'Product updated successfully!' : 'Product published successfully!');
      cancelEditingProduct();
      fetchProducts();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isAuthChecking) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-black text-xs font-bold uppercase tracking-widest animate-pulse">Verifying Access...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black pt-8 md:pt-28 pb-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 lg:gap-24">
        
        {/* Left Sidebar Menu */}
        <div className="md:w-1/4 shrink-0 flex flex-col space-y-8">
          <div>
            <button onClick={handleSignOut} className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors mb-8 block">
              Sign Out
            </button>
            <h1 className="text-3xl font-serif tracking-widest uppercase mb-4">Command Center</h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest leading-relaxed">
              Store Catalog<br/>& Inventory Management
            </p>
          </div>
          
          <div className="flex flex-col space-y-4 pt-8 border-t border-zinc-200">
            <button 
              onClick={() => { setActiveTab('products'); cancelEditingProduct(); }}
              className={`text-left text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'products' ? 'text-black' : 'text-zinc-400 hover:text-black'}`}
            >
             Manage Products
            </button>
            <button 
              onClick={() => { setActiveTab('categories'); cancelEditingCategory(); }}
              className={`text-left text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'categories' ? 'text-black' : 'text-zinc-400 hover:text-black'}`}
            >
              Manage Categories
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="md:w-3/4 flex-grow">
          
          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-12">
              <div className="border border-zinc-200 p-8 md:p-12">
                <div className="flex justify-between items-end border-b border-zinc-200 pb-4 mb-8">
                  <h3 className="text-xl font-serif uppercase tracking-widest">
                    {editingCategoryId ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  {editingCategoryId && (
                    <button onClick={cancelEditingCategory} className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black">
                      Cancel Edit
                    </button>
                  )}
                </div>
                
                <form onSubmit={handleSaveCategory} className="flex flex-col gap-6">
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Category Name</label>
                    <input required type="text" className="w-full bg-white border border-zinc-300 p-3 text-sm focus:outline-none focus:border-black transition-colors" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Description</label>
                    <textarea className="w-full bg-white border border-zinc-300 p-3 text-sm h-32 resize-none focus:outline-none focus:border-black transition-colors" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} />
                  </div>
                  <button type="submit" disabled={isProcessing} className="w-full bg-black text-white py-4 font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors mt-4 disabled:opacity-50">
                    {isProcessing ? 'Saving...' : (editingCategoryId ? 'Update Category' : 'Publish Category')}
                  </button>
                </form>
              </div>

              <div className="border border-zinc-200 p-8 md:p-12">
                <h3 className="text-xl font-serif mb-8 uppercase tracking-widest border-b border-zinc-200 pb-4">Existing Categories</h3>
                <div className="flex flex-col space-y-4">
                  {categories.length === 0 ? (
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">No categories created yet.</p>
                  ) : (
                    categories.map(c => (
                      <div key={c.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border border-zinc-200">
                        <div>
                          <p className="font-bold text-sm uppercase tracking-widest">{c.name}</p>
                          {c.description && <p className="text-xs text-zinc-500 line-clamp-1 mt-1">{c.description}</p>}
                        </div>
                        <div className="flex items-center gap-6 border-t sm:border-0 pt-3 sm:pt-0 w-full sm:w-auto">
                          <button onClick={() => startEditingCategory(c)} className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors">Edit</button>
                          <button onClick={() => handleDeleteCategory(c.id)} className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors">Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-12">
              
              <div className="border border-zinc-200 p-8 md:p-12 shadow-[0_0_40px_rgba(0,0,0,0.03)]">
                <div className="flex justify-between items-end border-b border-zinc-200 pb-4 mb-8">
                  <h3 className="text-xl font-serif uppercase tracking-widest">
                    {editingProductId ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  {editingProductId && (
                    <button onClick={cancelEditingProduct} className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black">
                      Cancel Edit
                    </button>
                  )}
                </div>
                
                <form onSubmit={handleSaveProduct} className="flex flex-col gap-6">
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Product Name</label>
                    <input required type="text" className="w-full bg-white border border-zinc-300 p-3 text-sm focus:outline-none focus:border-black transition-colors" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Description</label>
                    <textarea required className="w-full bg-white border border-zinc-300 p-3 text-sm h-32 resize-none focus:outline-none focus:border-black transition-colors" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Category</label>
                      <select required className="w-full bg-white border border-zinc-300 p-3 text-sm focus:outline-none focus:border-black transition-colors" value={newProduct.categoryId} onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})}>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Price (PKR)</label>
                      <input required type="number" step="0.01" className="w-full bg-white border border-zinc-300 p-3 text-sm focus:outline-none focus:border-black transition-colors" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                    </div>
                  </div>

                  {/* Unified Image Management */}
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">
                      Product Images
                    </label>
                    
                    {productImages.length > 0 && (
                      <div className="flex gap-4 overflow-x-auto py-4 mb-4 hide-scrollbar">
                        {productImages.map((img, idx) => (
                          <div key={img.id} className="relative w-24 aspect-[3/4] shrink-0 border border-zinc-200 group bg-zinc-50 overflow-hidden">
                            <img src={img.url} alt="product preview" className="w-full h-full object-cover object-top" />
                            {/* Actions (Always visible on mobile, hover on desktop) */}
                            <div className="absolute inset-0 bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                              <button type="button" onClick={() => moveImage(idx, 'left')} disabled={idx === 0} className="text-white hover:text-zinc-300 disabled:opacity-20 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                              </button>
                              <button type="button" onClick={() => removeImage(idx)} className="text-red-400 hover:text-red-300 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                              <button type="button" onClick={() => moveImage(idx, 'right')} disabled={idx === productImages.length - 1} className="text-white hover:text-zinc-300 disabled:opacity-20 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="w-full border border-zinc-300 border-dashed p-6 text-center relative hover:bg-zinc-50 transition-colors cursor-pointer">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                        {productImages.length > 0 ? '+ Upload additional images' : 'Upload product images'}
                      </p>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                    </div>
                  </div>

                  <div className="border border-zinc-200 p-6 space-y-4 bg-zinc-50/50">
                    <label className="block text-[10px] text-black font-bold uppercase tracking-widest mb-4">Available Sizes</label>
                    {newProduct.sizes.map((s, idx) => (
                      <div key={idx} className="flex gap-4">
                        <input required type="text" placeholder="Size (e.g. S, M, L)" value={s.size} onChange={e => handleSizeChange(idx, e.target.value)} className="w-full p-3 text-sm border border-zinc-300 focus:outline-none focus:border-black transition-colors" />
                        <button type="button" onClick={() => removeImage(idx)} className="text-zinc-400 hover:text-red-500 transition-colors px-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setNewProduct({...newProduct, sizes: [...newProduct.sizes, {size: ''}]})} className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black mt-2">
                      + Add Another Size
                    </button>
                  </div>

                  <button type="submit" disabled={isProcessing} className="w-full bg-black text-white py-4 font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors mt-6 disabled:opacity-50">
                    {isProcessing ? 'Saving Product...' : (editingProductId ? 'Update Product' : 'Publish Product')}
                  </button>
                </form>
              </div>

              {/* Categorized Existing Products */}
              <div className="border border-zinc-200 p-8 md:p-12">
                <h3 className="text-xl font-serif mb-8 uppercase tracking-widest border-b border-zinc-200 pb-4">Existing Products</h3>
                
                {categories.length === 0 || products.length === 0 ? (
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">No products found.</p>
                ) : (
                  <div className="space-y-12">
                    {categories.map(category => {
                      const categoryProducts = products.filter(p => p.category_id === category.id);
                      if (categoryProducts.length === 0) return null;

                      return (
                        <div key={category.id}>
                          <h4 className="text-xs font-bold text-black uppercase tracking-widest mb-4">{category.name}</h4>
                          <div className="flex flex-col space-y-4">
                            {categoryProducts.map(p => (
                              <div key={p.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 border border-zinc-200">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-16 bg-[#F2F2F2] shrink-0 border border-zinc-200">
                                    {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover object-top" />}
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm line-clamp-1">{p.name}</p>
                                    <p className="text-xs text-zinc-500">PKR {p.price}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6 border-t sm:border-0 pt-3 sm:pt-0">
                                  <button onClick={() => startEditingProduct(p)} className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors">
                                    Edit
                                  </button>
                                  <button onClick={() => handleDeleteProduct(p.id)} className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors">
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}