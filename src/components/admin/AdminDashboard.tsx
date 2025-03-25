import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Interfaces for our data types
interface DashboardStats {
  facultiesCount: number;
  subjectsCount: number;
  professorsCount: number;
  ratingsCount: number;
}

interface RecentActivity {
  type: string;
  details: string;
  timestamp: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    facultiesCount: 0,
    subjectsCount: 0,
    professorsCount: 0,
    ratingsCount: 0
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch dashboard statistics and recent activities
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token disponible');

        // Fetch stats
        const statsResponse = await axios.get('http://localhost:4000/api/admin/dashboard-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Dashboard Stats:', statsResponse.data);
        setStats(statsResponse.data);

        // Fetch recent activities
        const activitiesResponse = await axios.get('http://localhost:4000/api/admin/recent-activities', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Raw Activities Response:', activitiesResponse.data);
        
        // Ensure activities is an array and limit to last 5
        const activities = Array.isArray(activitiesResponse.data) 
          ? activitiesResponse.data.slice(0, 5) 
          : [];
        
        console.log('Processed Activities:', activities);
        setRecentActivities(activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error instanceof Error ? error.message : 'Un error desconocido ocurrió');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format timestamp to human-readable relative time
  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInHours = Math.round((now.getTime() - past.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Hace unos momentos';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    if (diffInHours < 48) return 'Hace 1 día';
    return `Hace ${Math.floor(diffInHours / 24)} días`;
  };

  // Parse activity to separate title and details
  const parseActivity = (activity: RecentActivity) => {
    // Split the type to separate the generic action from the specific entity
    const parts = activity.type.split(': ');
    return {
      title: parts[0], // "Nueva facultad creada"
      entity: parts[1] || '', // "Facultad de Organización Deportiva"
      details: activity.details,
      timestamp: activity.timestamp
    };
  };

  // Handle loading and error states
  if (loading) return <div className="text-center py-8">Cargando...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/admin/facultades" className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Facultades</p>
              <p className="text-2xl font-bold mt-1">{stats.facultiesCount}</p>
            </div>
            <div className="text-3xl">🏛️</div>
          </div>
        </Link>

        <Link to="/admin/materias" className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Materias</p>
              <p className="text-2xl font-bold mt-1">{stats.subjectsCount}</p>
            </div>
            <div className="text-3xl">📚</div>
          </div>
        </Link>

        <Link to="/admin/profesores" className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Profesores</p>
              <p className="text-2xl font-bold mt-1">{stats.professorsCount}</p>
            </div>
            <div className="text-3xl">👨‍🏫</div>
          </div>
        </Link>

        <Link to="/admin/resenas" className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Reseñas</p>
              <p className="text-2xl font-bold mt-1">{stats.ratingsCount}</p>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-indigo-600 text-white">
          <h2 className="font-medium">Actividad Reciente</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivities.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No hay actividades recientes
            </div>
          ) : (
            recentActivities.map((activity, index) => {
              const parsedActivity = parseActivity(activity);
              return (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="font-bold">{parsedActivity.title}</p>
                      {parsedActivity.entity && (
                        <p className="text-sm text-gray-700 mb-1">
                          {parsedActivity.entity}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 ml-4">
                      {formatTimestamp(parsedActivity.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;