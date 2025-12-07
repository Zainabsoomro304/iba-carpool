import React, { useState, useEffect } from 'react';
import { User, Ride, RideRequest, PageView } from '../types';
import * as DB from '../services/db';
import { MapPin, Clock, Users, DollarSign, Check, X, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';

// --- POST RIDE ---
export const PostRide: React.FC<{ user: User, onNavigate: (p: PageView) => void }> = ({ user, onNavigate }) => {
  const [form, setForm] = useState({
    departure_location: '',
    destination_location: '',
    departure_time: '',
    fare: '',
    total_seats: '3'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await DB.createRide({
        host_id: user.id,
        host_name: user.name,
        departure_location: form.departure_location,
        destination_location: form.destination_location,
        departure_time: form.departure_time,
        fare: form.fare ? Number(form.fare) : null,
        total_seats: Number(form.total_seats)
      });
      alert("Ride posted successfully!");
      onNavigate('dashboard');
    } catch (e) { alert("Failed to post ride"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Post a New Ride</h2>
            <button onClick={() => onNavigate('dashboard')} className="text-slate-500 hover:text-slate-800 text-sm">Cancel</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">From (Departure)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input required value={form.departure_location} onChange={e => setForm({...form, departure_location: e.target.value})} className="block w-full pl-10 px-3 py-2 border rounded-md" placeholder="e.g. IBA Main Campus" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">To (Destination)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input required value={form.destination_location} onChange={e => setForm({...form, destination_location: e.target.value})} className="block w-full pl-10 px-3 py-2 border rounded-md" placeholder="e.g. Gulshan-e-Iqbal" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Departure Time</label>
              <input type="datetime-local" required value={form.departure_time} onChange={e => setForm({...form, departure_time: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Fare (PKR, Optional)</label>
              <input type="number" value={form.fare} onChange={e => setForm({...form, fare: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md" placeholder="e.g. 500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Total Seats</label>
              <input type="number" min="1" max="6" required value={form.total_seats} onChange={e => setForm({...form, total_seats: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
          </div>

          <div className="pt-4 border-t">
            <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-3 rounded-lg font-medium hover:bg-blue-800 shadow-md">
              {loading ? 'Posting...' : 'Create Ride'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- BROWSE RIDES ---
export const BrowseRides: React.FC<{ user: User }> = ({ user }) => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [requestForm, setRequestForm] = useState({ price: '', comment: '' });
  const [loading, setLoading] = useState(true);

  const fetchRides = async () => {
    const all = await DB.getRides();
    // Filter out rides hosted by current user and past rides (optional logic)
    const filtered = all.filter(r => r.host_id !== user.id); 
    setRides(filtered);
    setLoading(false);
  };

  useEffect(() => { fetchRides(); }, []);

  const handleJoinRequest = async () => {
    if (!selectedRide) return;
    try {
      await DB.createRideRequest({
        ride_id: selectedRide.id,
        passenger_id: user.id,
        passenger_name: user.name,
        offered_price: requestForm.price ? Number(requestForm.price) : null,
        comment: requestForm.comment
      });
      alert("Request sent to driver!");
      setSelectedRide(null);
      setRequestForm({ price: '', comment: '' });
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Rides</h2>
      
      {loading ? <div className="text-center py-10">Loading rides...</div> : (
        rides.length === 0 ? <div className="text-center py-10 text-slate-500 bg-white rounded-lg border">No upcoming rides found.</div> :
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rides.map(ride => (
            <div key={ride.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs">
                        {ride.host_name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900">{ride.host_name}</p>
                        <p className="text-xs text-slate-500">Host</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ride.available_seats > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {ride.available_seats > 0 ? `${ride.available_seats} seats left` : 'Full'}
                  </span>
                </div>

                <div className="flex items-center text-slate-800 font-medium mb-2">
                  <span className="truncate max-w-[40%]">{ride.departure_location}</span>
                  <ArrowRight className="mx-2 h-4 w-4 text-slate-400" />
                  <span className="truncate max-w-[40%]">{ride.destination_location}</span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-slate-600 mb-4">
                  <div className="flex items-center"><Clock className="h-4 w-4 mr-1 text-slate-400" /> {new Date(ride.departure_time).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</div>
                  <div className="flex items-center"><DollarSign className="h-4 w-4 mr-1 text-slate-400" /> {ride.fare ? `~${ride.fare} PKR` : 'Negotiable'}</div>
                </div>
              </div>

              {ride.available_seats > 0 ? (
                <button 
                  onClick={() => setSelectedRide(ride)}
                  className="w-full bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 rounded-lg text-sm font-medium transition"
                >
                  Request to Join
                </button>
              ) : (
                <button disabled className="w-full bg-gray-100 text-gray-400 py-2 rounded-lg text-sm font-medium cursor-not-allowed">Ride Full</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Negotiation Modal */}
      {selectedRide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Join {selectedRide.host_name}'s Ride</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Offer Price (Optional)</label>
                <input 
                  type="number" 
                  placeholder={selectedRide.fare ? `Suggested: ${selectedRide.fare}` : 'Enter amount'}
                  className="w-full px-3 py-2 border rounded-md"
                  value={requestForm.price}
                  onChange={e => setRequestForm({...requestForm, price: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Comment (Optional)</label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Can we meet at the main gate?"
                  className="w-full px-3 py-2 border rounded-md"
                  value={requestForm.comment}
                  onChange={e => setRequestForm({...requestForm, comment: e.target.value})}
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button onClick={() => setSelectedRide(null)} className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                <button onClick={handleJoinRequest} className="flex-1 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800">Send Request</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MY RIDES (DRIVER VIEW) ---
export const MyRides: React.FC<{ user: User }> = ({ user }) => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<{[key: string]: RideRequest[]}>({});

  useEffect(() => {
    const loadData = async () => {
      const myRides = await DB.getRidesByHost(user.id);
      setRides(myRides);
      
      // Fetch requests for each ride
      const reqMap: any = {};
      for (const r of myRides) {
        const reqs = await DB.getRequestsForRide(r.id);
        reqMap[r.id] = reqs.filter(rq => rq.status === 'pending'); // Only show pending for action
      }
      setRequests(reqMap);
      setLoading(false);
    };
    loadData();
  }, [user.id]);

  const handleStatus = async (reqId: string, status: 'accepted' | 'rejected', rideId: string) => {
    try {
      await DB.updateRequestStatus(reqId, status);
      // Refresh local state roughly
      setRequests(prev => ({
        ...prev,
        [rideId]: prev[rideId].filter(r => r.id !== reqId)
      }));
      if (status === 'accepted') {
        setRides(prev => prev.map(r => r.id === rideId ? {...r, available_seats: r.available_seats - 1} : r));
      }
    } catch (e: any) { alert(e.message); }
  };

  if (loading) return <div className="p-8 text-center">Loading your rides...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">My Offered Rides</h2>
      {rides.length === 0 ? <div className="text-center text-slate-500">You haven't posted any rides yet.</div> :
        <div className="space-y-6">
          {rides.map(ride => (
            <div key={ride.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                   <span className="font-semibold text-slate-800">{ride.departure_location} to {ride.destination_location}</span>
                   <p className="text-xs text-slate-500 mt-1">{new Date(ride.departure_time).toLocaleString()} • {ride.available_seats} seats left</p>
                </div>
                {ride.available_seats === 0 && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">FULL</span>}
              </div>
              
              <div className="p-6">
                <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Pending Requests</h4>
                {!requests[ride.id] || requests[ride.id].length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No pending requests.</p>
                ) : (
                  <div className="space-y-3">
                    {requests[ride.id].map(req => (
                      <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="mb-2 sm:mb-0">
                          <p className="font-medium text-slate-900">{req.passenger_name}</p>
                          <div className="text-xs text-slate-600 flex items-center space-x-3">
                            {req.offered_price && <span className="flex items-center text-green-700"><DollarSign className="h-3 w-3 mr-1"/> Offered: {req.offered_price}</span>}
                            {req.comment && <span className="flex items-center"><MessageSquare className="h-3 w-3 mr-1"/> {req.comment}</span>}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                           {ride.available_seats > 0 && (
                             <button onClick={() => handleStatus(req.id, 'accepted', ride.id)} className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded-md flex items-center text-xs"><Check className="h-4 w-4 mr-1"/> Accept</button>
                           )}
                           <button onClick={() => handleStatus(req.id, 'rejected', ride.id)} className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 p-1.5 rounded-md flex items-center text-xs"><X className="h-4 w-4 mr-1"/> Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
};

// --- MY REQUESTS (PASSENGER VIEW) ---
export const MyRequests: React.FC<{ user: User }> = ({ user }) => {
  const [items, setItems] = useState<{request: RideRequest, ride: Ride}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DB.getRequestsByPassenger(user.id).then(res => {
      setItems(res);
      setLoading(false);
    });
  }, [user.id]);

  const getStatusColor = (s: string) => {
    switch(s) {
        case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
        case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading requests...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">My Ride Requests</h2>
      {items.length === 0 ? <div className="text-center text-slate-500">You haven't requested any rides yet.</div> :
        <div className="space-y-4">
          {items.map(({request, ride}) => (
            <div key={request.id} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm">
                <div className="mb-4 sm:mb-0">
                    <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded border capitalize ${getStatusColor(request.status)}`}>{request.status}</span>
                        <span className="text-xs text-slate-400">{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="font-semibold text-slate-800">{ride.departure_location} <span className="text-slate-400">→</span> {ride.destination_location}</p>
                    <p className="text-sm text-slate-500 mt-1">Host: {ride.host_name} • {new Date(ride.departure_time).toLocaleString()}</p>
                    {request.offered_price && <p className="text-xs text-slate-600 mt-1">You offered: {request.offered_price} PKR</p>}
                </div>
                {request.status === 'accepted' && (
                    <div className="text-right">
                        <button className="text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-md font-medium hover:bg-blue-100">
                            Contact Driver
                        </button>
                    </div>
                )}
            </div>
          ))}
        </div>
      }
    </div>
  );
};
