
'use client';

import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import BannerSlider from '../components/BannerSlider';
import SafeProductCard from '../components/SafeProductCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from '../components/ui/carousel'
import OfferCard from '../components/OfferCard';
import type { Product } from '../lib/types';

import { useProductStore } from '../lib/productStore';
import { NEWARRIVALS_PRODUCTS } from '../lib/data/newarrivals';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import MixedProductGrid from '../components/MixedProductGrid';
import { useToast } from '../hooks/use-toast';
import BusinessOpportunityBanner from '../components/BusinessOpportunityBanner';
import { MessageCircle, Users } from 'lucide-react';





const filterCategories = ['All', 'Electronics', 'Home', 'New Arrivals', 'Customizable'];
const PRODUCTS_TO_SHOW = 8;
const VISIBLE_COUNT_KEY = 'home_visible_count';
const SELECTED_CATEGORY_KEY = 'home_selected_category';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { products, isLoading } = useProductStore();
  const { toast } = useToast();
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_TO_SHOW);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [api, setApi] = useState<CarouselApi>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load persisted state on mount
  useEffect(() => {
    const savedVisibleCount = localStorage.getItem(VISIBLE_COUNT_KEY);
    const savedCategory = localStorage.getItem(SELECTED_CATEGORY_KEY);

    if (savedVisibleCount) {
      setVisibleCount(parseInt(savedVisibleCount, 10));
    }
    if (savedCategory) {
      setSelectedCategory(savedCategory);
    }
  }, []);

  useEffect(() => {
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search)
    const refCode = urlParams.get('ref')

    if (refCode) {
      toast({
        title: "Referral Link Detected!",
        description: `Use code ${refCode} at checkout for 5% discount`,
      })

      // Clean URL
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }, [toast])





  const techDeals = useMemo(() => {
    return products.filter(p => (p.category === 'Tech' || p.category === 'Electronics') && p.quantity > 0).slice(0, 6);
  }, [products]);

  const homeDeals = useMemo(() => {
    return products.filter(p => p.category === 'Home' && p.quantity > 0).slice(0, 6);
  }, [products]);

  const newArrivals = useMemo(() => {
    const apiNewArrivals = products.filter(p => p.category === 'New Arrivals' && p.quantity > 0);
    const jsonNewArrivals = NEWARRIVALS_PRODUCTS.filter(p => p.quantity > 0).slice(0, 6);
    return [...apiNewArrivals, ...jsonNewArrivals].slice(0, 6);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const inStockProducts = products.filter(p => p.quantity > 0);
    if (selectedCategory === 'All') {
      return inStockProducts;
    }
    if (selectedCategory === 'Electronics') {
      return inStockProducts.filter(p => p.category === 'Electronics' || p.category === 'Tech');
    }
    if (selectedCategory === 'New Arrivals') {
      const apiNewArrivals = inStockProducts.filter(p => p.category === 'New Arrivals');
      const jsonNewArrivals = NEWARRIVALS_PRODUCTS.filter(p => p.quantity > 0);
      return [...apiNewArrivals, ...jsonNewArrivals];
    }
    if (selectedCategory === 'Customizable') {
      return inStockProducts.filter(p => p.category === 'Customizable');
    }
    return inStockProducts.filter(p => p.category === selectedCategory);
  }, [selectedCategory, products]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setVisibleCount(PRODUCTS_TO_SHOW);
    localStorage.setItem(SELECTED_CATEGORY_KEY, category);
    localStorage.setItem(VISIBLE_COUNT_KEY, PRODUCTS_TO_SHOW.toString());
  };

  const loadMoreProducts = useCallback(() => {
    if (isLoadingMore || visibleCount >= filteredProducts.length) return;
    
    setIsLoadingMore(true);
    
    // Simulate loading delay
    setTimeout(() => {
      const newCount = visibleCount + PRODUCTS_TO_SHOW;
      setVisibleCount(newCount);
      localStorage.setItem(VISIBLE_COUNT_KEY, newCount.toString());
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, visibleCount, filteredProducts.length]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredProducts.length) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [loadMoreProducts, visibleCount, filteredProducts.length]);



  if (!mounted) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              "name": "ShopWave",
              "alternateName": "Shop Wave",
              "description": "ShopWave - India's #1 online shopping destination! Cheapest prices guaranteed, free delivery, 50% off deals on tech accessories, home essentials & ayurvedic products across India.",
              "url": "/",
              "telephone": "+91-91574-99884",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "ShopWave Products",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Tech Accessories",
                      "category": "Electronics"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Home & Kitchen",
                      "category": "Home & Garden"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Ayurvedic Products",
                      "category": "Health & Beauty"
                    }
                  }
                ]
              }
            })
          }}
        />
      </Head>
      <div className="space-y-8">
      <BannerSlider />

      <section>
        <div className="grid grid-cols-3 gap-2 md:gap-3">
            <Link href="/search?category=Tech" className="relative block h-20 md:h-48 overflow-hidden rounded-lg md:rounded-xl group">
                <Image src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/01_0748acd3-4797-400f-997d-6cecf6b22f5a.webp?updatedAt=1756628128432" alt="Tech" fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="tech gadgets" />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center p-1 md:p-2">
                    <h3 className="text-xs md:text-md font-bold text-white text-center">Tech Accessories</h3>
                </div>
            </Link>
            <Link href="/search?category=Home" className="relative block h-20 md:h-48 overflow-hidden rounded-lg md:rounded-xl group">
                <Image src="https://Shopwave.b-cdn.net/new%20arival/17865..1.webp" alt="Home" fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="modern living room" />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center p-1 md:p-2">
                    <h3 className="text-xs md:text-md font-bold text-white text-center">Home & Kitchen</h3>
                </div>
            </Link>
            <Link href="/new-arrivals" className="relative block h-20 md:h-48 overflow-hidden rounded-lg md:rounded-xl group">
                <Image src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_6d35b019-089f-4949-9571-7a7bd595fccd.webp" alt="New Arrivals" fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="new arrivals shopping" />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center p-1 md:p-2">
                    <h3 className="text-xs md:text-md font-bold text-white text-center">New Arrivals</h3>
                </div>
            </Link>
        </div>
      </section>



      <section id="tech-offers">
        <h2 className="text-2xl font-bold mb-4 text-center">Top Offers</h2>
         <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-1 sm:-ml-2 md:-ml-4">
            <CarouselItem className="pl-1 sm:pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/3"><OfferCard title="Mobile Accessories" products={techDeals} href="/search?subcategory=Accessories"/></CarouselItem>
            <CarouselItem className="pl-1 sm:pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/3"><OfferCard title="Kitchen Tools" products={homeDeals} href="/search?subcategory=Kitchen%20Tools"/></CarouselItem>
            <CarouselItem className="pl-1 sm:pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/3"><OfferCard title="LED Lights" products={newArrivals} href="/search?subcategory=LED%20Lights"/></CarouselItem>
          </CarouselContent>

        </Carousel>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 text-center">Shop by Category</h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          <Link href="/search?subcategory=Accessories" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/0294.webp?updatedAt=1756627296166" alt="Mobile Accessories" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 leading-tight text-center">Mobile Accessories</h4>
          </Link>

          <Link href="/search?subcategory=Computer%20Accessories" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/01_d6ef1d68-1400-4132-ad4a-a54ca8de4577.avif" alt="Computer Accessories" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 leading-tight text-center">Computer Accessories</h4>
          </Link>

          <Link href="/search?subcategory=Audio" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://Shopwave.b-cdn.net/NEW%20ARIVALS/01_67515437-4d2e-40ab-8ecf-bcabffe751be.webp" alt="Audio" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 leading-tight text-center">Audio</h4>
          </Link>

          <Link href="/search?subcategory=Lighting" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/07_4a3ac08b-5f90-4f47-9c6f-a48d0999f3e7.webp?updatedAt=1756628649421" alt="Lighting" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 leading-tight text-center">Lighting</h4>
          </Link>

          <Link href="/search?subcategory=Power%20%26%20Cables" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/01_0748acd3-4797-400f-997d-6cecf6b22f5a.webp?updatedAt=1756628128432" alt="Power & Cables" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 leading-tight text-center">Power & Cables</h4>
          </Link>

          <Link href="/search?subcategory=Fans" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/12249d16-5521-4931-b03a-e672fc47fb87.webp?updatedAt=1757057794638" alt="Fans & Cooling" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 leading-tight text-center">Fans & Cooling</h4>
          </Link>

          <Link href="/search?subcategory=LED%20Lights" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://Shopwave.b-cdn.net/NEW%20ARIVALS/3_12e4cc87-a760-425d-badf-365f48f8677d.webp" alt="LED Lights" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 leading-tight text-center">LED Lights</h4>
          </Link>

          <Link href="/search?subcategory=Car%20Accessories" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://Shopwave.b-cdn.net/new%20arival/01_15d3c786-e22a-4818-8a49-d1c8c6662719.webp" alt="Car Accessories" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 leading-tight text-center">Car Accessories</h4>
          </Link>

          <Link href="/search?subcategory=Kitchen%20Appliances" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://Shopwave.b-cdn.net/new%20arival/17865..1.webp" alt="Kitchen Appliances" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 leading-tight text-center">Kitchen Appliances</h4>
          </Link>

          <Link href="/search?subcategory=Cables%20%26%20Chargers" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://Shopwave.b-cdn.net/new%20arival/02_71c68310-5be0-4fac-97e3-de92ea6df361.webp" alt="Cables & Chargers" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 leading-tight text-center">Cables & Chargers</h4>
          </Link>

          <Link href="/search?subcategory=Gifts" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/04_light_59099232-79e1-4dec-805f-42dc9208c96b.webp" alt="Gifts" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 leading-tight text-center">Gifts</h4>
          </Link>

          <Link href="/search?category=Customizable" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://Shopwave.b-cdn.net/Custom%20Print%20Products/6_6cbab775-d2f1-40aa-b598-5fe7c1943372.webp" alt="Customise Product" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 leading-tight text-center">Customise Product</h4>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-center">Featured Products</h2>

        <div className="flex justify-center mb-4">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 bg-gray-100 rounded-full p-1">
            {filterCategories.map(c => (
              <button
                key={c}
                onClick={() => handleCategoryClick(c)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedCategory === c ? 'bg-brand text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-3">
           {visibleProducts.map((p, index) => (
              <SafeProductCard key={`${p.id}-${index}`} p={p} />
          ))}
        </div>

        {/* Infinite Scroll Trigger */}
        {visibleCount < filteredProducts.length && (
          <div ref={observerRef} className="text-center mt-8 py-4">
            {isLoadingMore && (
              <div className="flex justify-center items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
                <span className="text-gray-600 text-sm">Loading more products...</span>
              </div>
            )}
          </div>
        )}
        
        {/* End of products message */}
        {visibleCount >= filteredProducts.length && filteredProducts.length > PRODUCTS_TO_SHOW && (
          <div className="text-center mt-8 py-4">
            <p className="text-gray-500 text-sm">You've seen all products in this category</p>
          </div>
        )}
      </section>

      {/* Footer with Dropshipping Links */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">ShopWave</h3>
              <p className="text-gray-300">India's #1 online shopping destination with cheapest prices guaranteed!</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/search?category=Tech" className="text-gray-300 hover:text-white">Tech Accessories</Link></li>
                <li><Link href="/search?category=Home" className="text-gray-300 hover:text-white">Home & Kitchen</Link></li>
                <li><Link href="/new-arrivals" className="text-gray-300 hover:text-white">New Arrivals</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-white">Terms & Conditions</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Business Inquiries</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-300 mb-2">For Dropshipping & Wholesale:</p>
                  <div className="flex flex-col space-y-2">
                    <a
                      href="https://wa.me/919157499884?text=Hi, I'm interested in Dropshipping business opportunity"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      WhatsApp for Dropshipping
                    </a>
                    <a
                      href="https://wa.me/919157499884?text=Hi, I'm interested in Wholesale business opportunity"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Users className="w-5 h-5 mr-2" />
                      WhatsApp for Wholesale
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-4 text-center">
            <p className="text-gray-400">&copy; 2024 ShopWave. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <BusinessOpportunityBanner />

    </div>
    </>
  );
}
