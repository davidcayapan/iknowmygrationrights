import React, { useState, useEffect } from 'react';
import { BarChart2, FileText, Users, AlertCircle, TrendingUp } from 'lucide-react';
import { getDocumentStats, getTopEntities, getTopTopics } from '../services/analyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Analytics: React.FC = () => {
  const [stats, setStats] = useState({
    total_documents: 0,
    processed_documents: 0,
    failed_documents: 0,
    average_processing_time: 0,
  });
  const [entities, setEntities] = useState<Array<{ name: string; count: number; type: string }>>([]);
  const [topics, setTopics] = useState<Array<{ name: string; document_count: number; average_relevance: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, entitiesData, topicsData] = await Promise.all([
          getDocumentStats(),
          getTopEntities(10),
          getTopTopics(10),
        ]);

        setStats(statsData);
        setEntities(entitiesData);
        setTopics(topicsData);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" aria-label="Loading analytics data"></div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">Insights from your immigration documents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" role="region" aria-label="Document statistics">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Total Documents</h2>
            <FileText className="h-6 w-6 text-indigo-600" aria-hidden="true" />
          </div>
          <p className="text-3xl font-bold text-gray-900" aria-label={`${stats.total_documents} total documents`}>
            {stats.total_documents}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Processed</h2>
            <Users className="h-6 w-6 text-green-600" aria-hidden="true" />
          </div>
          <p className="text-3xl font-bold text-gray-900" aria-label={`${stats.processed_documents} processed documents`}>
            {stats.processed_documents}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Failed</h2>
            <AlertCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <p className="text-3xl font-bold text-gray-900" aria-label={`${stats.failed_documents} failed documents`}>
            {stats.failed_documents}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Avg. Processing</h2>
            <TrendingUp className="h-6 w-6 text-indigo-600" aria-hidden="true" />
          </div>
          <p className="text-3xl font-bold text-gray-900" aria-label={`Average processing time: ${Math.round(stats.average_processing_time / 1000)} seconds`}>
            {Math.round(stats.average_processing_time / 1000)}s
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Top Entities</h2>
          <div className="h-80" role="img" aria-label="Bar chart showing top entities">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={entities}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Top Topics</h2>
          <div className="h-80" role="img" aria-label="Bar chart showing top topics">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="document_count" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Entity Breakdown</h2>
          <div className="overflow-hidden">
            <table className="min-w-full" role="table" aria-label="Entity breakdown">
              <thead>
                <tr className="border-b">
                  <th scope="col" className="text-left py-3 px-4">Entity</th>
                  <th scope="col" className="text-left py-3 px-4">Type</th>
                  <th scope="col" className="text-right py-3 px-4">Count</th>
                </tr>
              </thead>
              <tbody>
                {entities.map((entity, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{entity.name}</td>
                    <td className="py-2 px-4">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                        {entity.type}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right">{entity.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Topic Analysis</h2>
          <div className="overflow-hidden">
            <table className="min-w-full" role="table" aria-label="Topic analysis">
              <thead>
                <tr className="border-b">
                  <th scope="col" className="text-left py-3 px-4">Topic</th>
                  <th scope="col" className="text-right py-3 px-4">Documents</th>
                  <th scope="col" className="text-right py-3 px-4">Relevance</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{topic.name}</td>
                    <td className="py-2 px-4 text-right">{topic.document_count}</td>
                    <td className="py-2 px-4 text-right">
                      {(topic.average_relevance * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Analytics;