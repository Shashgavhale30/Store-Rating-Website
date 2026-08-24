import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api'; // Using generic api for the direct /users/:id call

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        setUser(response.data);
      } catch (err) {
        setError('Failed to load user details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [id]);

  if (loading) return <div className="text-gray-500">Loading user details...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!user) return <div className="text-gray-500">User not found.</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/admin/users" className="text-primary hover:underline">&larr; Back to Users</Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
            <div className="text-sm font-medium text-gray-500">Name</div>
            <div className="md:col-span-2 text-sm text-gray-900 font-semibold">{user.name}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
            <div className="text-sm font-medium text-gray-500">Email</div>
            <div className="md:col-span-2 text-sm text-gray-900">{user.email}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
            <div className="text-sm font-medium text-gray-500">Address</div>
            <div className="md:col-span-2 text-sm text-gray-900">{user.address}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
            <div className="text-sm font-medium text-gray-500">Role</div>
            <div className="md:col-span-2">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                user.role === 'OWNER' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {user.role}
              </span>
            </div>
          </div>

          {user.role === 'OWNER' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
              <div className="text-sm font-medium text-gray-500">Store Average Rating</div>
              <div className="md:col-span-2 text-sm font-bold text-accent">
                ★ {parseFloat(user.average_rating).toFixed(1)}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="text-sm font-medium text-gray-500">Joined Date</div>
            <div className="md:col-span-2 text-sm text-gray-500">
              {new Date(user.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
