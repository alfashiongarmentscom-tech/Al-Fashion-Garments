'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function ShopPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCatalog() {
      // Read the URL to see if a category was clicked from the home page
      const params = new URLSearchParams(window.location.search);
      const urlCategory = params.get('category');
      if (urlCategory) {
        setSelectedCategory(urlCategory);
      }

      const { data: catData } = await supabase.from('categories').select('*');
      if (catData) setCategories(catData);

      const { data: prodData } = await supabase.from('products').select('*, product_sizes(*)');
      if (prodData) setProducts(prodData);

      setLoading(false);
    }
    fetchCatalog();
  }, []);
  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading Collection...</p>
      </main>
    );
  }

  const activeCategoryData = categories.find(c => c.id === selectedCategory);
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category_id === selectedCategory);

  return (
    <main className="min-h-screen bg-white pb-20">
      
      {/* Editorial Text Header */}
      <div className="w-full bg-white border-b border-zinc-200 px-4 md:px-8 py-10 md:py-16">
        <h1 className="text-black text-3xl md:text-5xl font-serif mb-3 tracking-wide uppercase">
          {selectedCategory === 'all' ? "Collection" : activeCategoryData?.name}
        </h1>
        <p className="text-zinc-500 text-xs md:text-sm max-w-2xl leading-relaxed">
          {selectedCategory === 'all' 
            ? "Explore our curated collection of garments and apparel, crafted for timeless style and quality." 
            : activeCategoryData?.description}
        </p>
      </div>

      {/* Horizontal Category Selector */}
      <div className="w-full border-b border-zinc-200">
        <div className="flex items-center gap-8 px-4 md:px-8 py-5 overflow-x-auto hide-scrollbar whitespace-nowrap">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`text-xs uppercase tracking-widest font-bold transition-colors ${selectedCategory === 'all' ? 'text-black' : 'text-zinc-400 hover:text-black'}`}
          >
            All Products
          </button>
          {categories.map((category) => (
            <button 
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`text-xs uppercase tracking-widest font-bold transition-colors ${selectedCategory === category.id ? 'text-black' : 'text-zinc-400 hover:text-black'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Count Indicator */}
      <div className="px-4 md:px-8 py-4 text-[11px] uppercase tracking-widest text-zinc-400 font-bold">
        {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-zinc-200 border-y border-zinc-200">
        {filteredProducts.map(product => {
          const displayImage = product.images?.[0] || '';
          return (
            <Link 
              href={`/shop/${product.id}`} 
              key={product.id} 
              className="bg-white group relative flex flex-col"
            >
              <div className="w-full aspect-[3/4] relative overflow-hidden bg-[#F9FAFB]">
                {displayImage ? (
                  <img 
                    src={displayImage} 
                    alt={product.name} 
                    className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-105" 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-300 text-xs uppercase tracking-widest">No Image</div>
                )}
              </div>
              <div className="p-4 md:p-6 text-center">
                <h3 className="text-xs md:text-sm font-medium text-black line-clamp-1 mb-1">{product.name}</h3>
                <p className="text-zinc-500 text-xs">PKR {product.price}</p>
              </div>
            </Link>
          );
        })}
      </div>
      
    </main>
  );
}