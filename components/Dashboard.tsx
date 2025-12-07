import React from 'react';
import { User, PageView } from '../types';
import { PlusCircle, Search, Car, List } from 'lucide-react';

interface DashboardProps {
  user: User;
  onNavigate: (page: PageView) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome back, <span className="font-semibold text-blue-800">{user.name}</span>. What would you like to do today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Post Ride */}
        <div 
          onClick={() => onNavigate('post-ride')}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition cursor-pointer group"
        >
          <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition">
            <PlusCircle className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Post a Ride</h3>
          <p className="text-sm text-slate-500">Driving somewhere? Offer a ride to other students and share the fare.</p>
        </div>

        {/* Browse Rides */}
        <div 
          onClick={() => onNavigate('browse-rides')}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition cursor-pointer group"
        >
          <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition">
            <Search className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Browse Rides</h3>
          <p className="text-sm text-slate-500">Need a lift? Find available rides matching your route and schedule.</p>
        </div>

        {/* My Rides (Driver) */}
        <div 
          onClick={() => onNavigate('my-rides')}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition cursor-pointer group"
        >
          <div className="bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition">
            <Car className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">My Offered Rides</h3>
          <p className="text-sm text-slate-500">Manage rides you've posted and accept passenger requests.</p>
        </div>

        {/* My Requests (Passenger) */}
        <div 
          onClick={() => onNavigate('my-requests')}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition cursor-pointer group"
        >
          <div className="bg-orange-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-100 transition">
            <List className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">My Requests</h3>
          <p className="text-sm text-slate-500">Check the status of rides you've requested to join.</p>
        </div>

      </div>

      <div className="mt-12 bg-blue-50 rounded-2xl p-8 border border-blue-100">
        <h3 className="text-xl font-bold text-blue-900 mb-4">Carpool Etiquette</h3>
        <ul className="list-disc list-inside space-y-2 text-blue-800 text-sm">
            <li>Be on time for departures.</li>
            <li>Respect the driver's vehicle and preferences (music, AC, etc.).</li>
            <li>Negotiate fares fairly before the trip starts.</li>
            <li>Update your status if plans change.</li>
        </ul>
      </div>
    </div>
  );
};
