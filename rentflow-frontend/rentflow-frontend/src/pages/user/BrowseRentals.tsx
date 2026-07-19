import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import UserLayout from '@/components/user/UserLayout'
import StatusBadge from '@/components/common/StatusBadge'
import { rentalService } from '@/services/rentalService'
import { wishlistService } from '@/services/wishlistService'
import type { Rental } from '@/types'
import { useNavigate } from 'react-router-dom'

export default function BrowseRentals() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const [category, setCategory] = useState('All categories')
  const [brand, setBrand] = useState('All brands')
  const [size, setSize] = useState('Any size')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortBy, setSortBy] = useState('price-asc')
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())

  const fetchWishlist = () => {
    wishlistService.getMyWishlist().then((items) => {
      setWishlist(new Set(items.map(i => i.id)))
    }).catch(() => {})
  }

  const fetchRentals = () => {
    setLoading(true)
    rentalService
      .browseAvailable({
        category: category === 'All categories' ? '' : category,
        brand: brand === 'All brands' ? '' : brand,
        size: size === 'Any size' ? '' : size,
        startDate,
        endDate
      })
      .then(setRentals)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchRentals()
    fetchWishlist()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleApplyFilters = () => {
    fetchRentals()
  }

  const handleToggleWishlist = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await wishlistService.toggleWishlist(itemId)
      setWishlist(prev => {
        const next = new Set(prev)
        if (res.status === 'added') next.add(itemId)
        else next.delete(itemId)
        return next
      })
    } catch {}
  }

  const sortedRentals = [...rentals].sort((a, b) => {
    if (sortBy === 'price-asc') return a.dailyRate - b.dailyRate;
    if (sortBy === 'price-desc') return b.dailyRate - a.dailyRate;
    return 0;
  });

  return (
    <UserLayout pageTitle="Catalog" pageDescription="">
      
      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-end gap-4 mb-8">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select 
            value={category} 
            onChange={e => setCategory(e.target.value)}
            className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 bg-transparent dark:text-white"
          >
            <option>All categories</option>
            <option>Electronics</option>
            <option>Cameras & Photography</option>
            <option>Furniture</option>
            <option>Tools & Equipment</option>
            <option>Event & Party Equipment</option>
          </select>
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-gray-500 mb-1">Brand</label>
          <select 
            value={brand} 
            onChange={e => setBrand(e.target.value)}
            className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 bg-transparent dark:text-white"
          >
            <option>All brands</option>
            <option>Sony</option>
            <option>Canon</option>
            <option>Bosch</option>
            <option>Arri</option>
          </select>
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-gray-500 mb-1">Size</label>
          <select 
            value={size} 
            onChange={e => setSize(e.target.value)}
            className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 bg-transparent dark:text-white"
          >
            <option>Any size</option>
            <option>Small</option>
            <option>Medium</option>
            <option>Large</option>
          </select>
        </div>
        <div className="flex-[2] w-full">
          <label className="block text-xs font-medium text-gray-500 mb-1">Availability period</label>
          <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-transparent">
             <Calendar className="h-5 w-5 ml-1 text-gray-400" />
             <input 
               type="date" 
               value={startDate}
               onChange={e => setStartDate(e.target.value)}
               className="bg-transparent border-none text-sm focus:ring-0 w-full dark:text-white outline-none"
             />
             <span className="text-gray-400">-</span>
             <input 
               type="date" 
               value={endDate}
               onChange={e => setEndDate(e.target.value)}
               className="bg-transparent border-none text-sm focus:ring-0 w-full dark:text-white outline-none"
             />
          </div>
        </div>
        <div className="w-full md:w-auto">
          <button 
            onClick={handleApplyFilters}
            className="w-full md:w-auto bg-black hover:bg-gray-800 text-white font-medium py-2.5 px-8 rounded-md shadow-sm"
          >
            Apply
          </button>
        </div>
        <div className="flex-1 w-full md:w-auto">
          <label className="block text-xs font-medium text-gray-500 mb-1">Sort By</label>
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 bg-transparent dark:text-white"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-xs font-bold text-emerald-600 tracking-wider uppercase mb-2">Equipment Collection</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Rent smarter. Build more.</h1>
          <p className="text-sm text-gray-500 mt-4 sm:mt-0">{rentals.length} pieces ready to explore</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow">
          {loading ? (
            <p className="text-sm text-slate-400">Loading available items…</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="browse-rentals-grid">
              {sortedRentals.map((r) => {
                const inWishlist = wishlist.has(r.id);
                return (
                <div key={r.id} onClick={() => navigate(`/product/${r.id}`)} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="flex items-start justify-between mb-4">
                    <StatusBadge status={r.status} />
                    <button onClick={(e) => handleToggleWishlist(r.id, e)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${inWishlist ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} viewBox="0 0 24 24" stroke="currentColor" fill={inWishlist ? 'currentColor' : 'none'} strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-grow flex flex-col justify-end">
                    <div className="h-40 bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                       {/* Placeholder for actual image */}
                       <span className="text-gray-400 text-sm">Image</span>
                    </div>
                    
                    <h3 className="font-display text-xl font-bold text-rf-navy-900 mb-1">
                      {r.itemName}
                    </h3>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-gray-500">{r.category}</p>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      High-quality equipment tailored for professional requirements.
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                       <p className="font-display text-lg font-bold text-rf-navy-900">
                         ${r.dailyRate.toFixed(2)}
                         <span className="text-xs font-normal text-slate-400"> / day</span>
                       </p>
                    </div>

                    {/* Quick Add Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                       <button
                         type="button"
                         onClick={() => navigate(`/product/${r.id}`)}
                         disabled={r.status === 'reserved'}
                         className="w-full flex items-center justify-center gap-2 rounded-lg bg-black text-white py-2.5 text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
                       >
                         {r.status === 'reserved' ? 'Reserved' : 'View Details & Book'}
                       </button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>

        {/* Side Panel (Recently Viewed Mockup) */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
           <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
             <div className="flex items-center gap-2 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-900 dark:text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recently viewed</h2>
             </div>
             
             <div className="space-y-4">
               {/* Mock Items */}
               <div className="flex gap-4 items-center">
                 <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
                 <div>
                   <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight mb-1">CAT 320 GC Excavator</h4>
                   <p className="text-xs text-gray-500 mb-1">$450/day</p>
                   <span className="text-[10px] font-bold text-green-600 uppercase">Available</span>
                 </div>
               </div>
               
               <div className="flex gap-4 items-center">
                 <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
                 <div>
                   <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight mb-1">Bosch GBH 18V-26</h4>
                   <p className="text-xs text-gray-500 mb-1">$45/day</p>
                   <span className="text-[10px] font-bold text-orange-600 uppercase">In Demand</span>
                 </div>
               </div>
               
               <button className="w-full mt-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                 View all history
               </button>
             </div>
           </div>

           <div className="bg-rf-navy-900 rounded-xl p-6 text-white">
             <div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center mb-4">
                <span className="font-bold text-lg">?</span>
             </div>
             <h3 className="text-xl font-bold mb-2">Need help choosing?</h3>
             <p className="text-sm text-gray-300 mb-4">Our experts are ready to assist you in finding the right equipment.</p>
             <button className="text-sm font-bold text-white underline">Contact Support</button>
           </div>
        </div>
      </div>
    </UserLayout>
  )
}
