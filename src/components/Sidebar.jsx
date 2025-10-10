import React from 'react'
import { assets } from '../assets/admin_assets/assets'
import {NavLink} from 'react-router-dom'
const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-orange-400 text-orange-500 border-r-1'>
      <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>
        <NavLink to='/add' className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l">
           <img src={assets.add_icon} alt="" className="w-5 h-5" />
           <p className="hidden md:block">Add Blog</p>
        </NavLink>
        <NavLink to='/list' className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l">
           <img src={assets.order_icon} alt="" className="w-5 h-5" />
           <p className="hidden md:block">List Blogs</p>
        </NavLink>
        <NavLink to='/faq' className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l">
           <img src={assets.order_icon} alt="" className="w-5 h-5" />
           <p className="hidden md:block">FAQ</p>
        </NavLink>
        <NavLink to='/team' className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l">
           <img src={assets.order_icon} alt="" className="w-5 h-5" />
           <p className="hidden md:block">Team</p>
        </NavLink>
        <NavLink to='/reviews' className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l">
           <img src={assets.order_icon} alt="" className="w-5 h-5" />
           <p className="hidden md:block">Reviews</p>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar