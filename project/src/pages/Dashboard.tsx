import React from 'react';
import { FileText, Users, AlertCircle, BarChart2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../components/dashboard/DashboardCard';
import FileUploader from '../components/documents/FileUploader';
import ChatInterface from '../components/chatbot/ChatInterface';
import DocumentInsightCard from '../components/analytics/DocumentInsightCard';
import { Document, DocumentInsights } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Sample data
  const documentInsights: DocumentInsights = {
    summary: "This immigration memo outlines recent changes to asylum application procedures and processing timelines under the current administration's policies.",
    keyFindings: [
      "New expedited processing path for applicants from certain countries",
      "Updated documentation requirements for employment authorization",
      "Revised guidelines for credible fear interviews",
      "Changes to the detention policy for asylum seekers"
    ],
    entities: [
      { name: "USCIS", type: "organization", count: 23 },
      { name: "ICE", type: "organization", count: 18 },
      { name: "June 2023", type: "date", count: 12 },
    ],
    topics: [
      { name: "Asylum Process", relevance: 0.87 },
      { name: "Documentation", relevance: 0.65 },
      { name: "Legal Procedures", relevance: 0.58 },
    ],
    sentiment: 0.2
  };

  const recentDocuments: Document[] = [
    {
      id: "1",
      title: "USCIS Policy Memo 2023-04: Asylum Procedures",
      fileType: "pdf",
      uploadDate: "2023-06-15",
      size: 2500000,
      status: "analyzed",
      insights: documentInsights
    },
    {
      id: "2",
      title: "DOJ Immigration Court Filing Guidelines 2023",
      fileType: "pdf",
      uploadDate: "2023-06-10",
      size: 1800000,
      status: "analyzed",
      insights: {
        ...documentInsights,
        summary: "This document provides updated guidelines for filing documents with immigration courts, including new electronic submission requirements.",
        sentiment: 0.1
      }
    }
  ];

  const handleFilesSelected = (files: File[]) => {
    console.log('Files selected for processing:', files);
    // Here you would call your Snowflake integration
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Immigration Analytics Dashboard</h1>
          <p className="text-gray-600">Analyze your DOJ immigration documents with Snowflake AI</p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="Documents Processed" 
            value="18" 
            icon={<FileText size={20} />}
            trend={{ value: 12, isPositive: true }}
          />
          <DashboardCard 
            title="Individuals Tracked" 
            value="143" 
            icon={<Users size={20} />}
          />
          <DashboardCard 
            title="Pending Cases" 
            value="27" 
            icon={<AlertCircle size={20} />}
            trend={{ value: 5, isPositive: false }}
          />
          <DashboardCard 
            title="Analytics Generated" 
            value="46" 
            icon={<BarChart2 size={20} />}
            trend={{ value: 8, isPositive: true }}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* File Upload Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload DOJ Immigration Files</h2>
              <FileUploader onFilesSelected={handleFilesSelected} />
            </div>
            
            {/* Recent Document Insights */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Document Insights</h2>
                <button 
                  onClick={() => navigate('/documents')}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                >
                  <Search className="h-4 w-4 mr-1" />
                  View All Documents
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentDocuments.map(doc => (
                  <DocumentInsightCard 
                    key={doc.id}
                    document={doc}
                    insights={doc.insights!}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column - Chatbot */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ask About Your Documents</h2>
            <ChatInterface />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;