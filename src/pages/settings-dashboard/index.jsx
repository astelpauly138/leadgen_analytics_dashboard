import { useState } from 'react';
import Sidebar from '../../components/navigation/Sidebar';
import Header from '../../components/navigation/Header';
import StatusCard from './components/StatusCard';
import ConfigurationPanel from './components/ConfigurationPanel';
import SystemLogViewer from './components/SystemLogViewer';
import PerformanceMetrics from './components/PerformanceMetrics';
import BackupStatus from './components/BackupStatus';

const SettingsDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('google_sheets');

  const systemStatus = [
    {
      title: "Google Sheets API",
      status: "operational",
      lastCheck: "2 minutes ago",
      icon: "FileSpreadsheet",
      details: "All read/write operations functioning normally with 99.8% uptime"
    },
    {
      title: "Webhook",
      status: "operational",
      lastCheck: "1 minute ago",
      icon: "Webhook",
      details: "Webhook endpoints responding with average latency of 145ms"
    },
    {
      title: "Email Service",
      status: "warning",
      lastCheck: "5 minutes ago",
      icon: "Mail",
      details: "Elevated delivery times detected. Monitoring for resolution"
    },
    {
      title: "Database Performance",
      status: "operational",
      lastCheck: "3 minutes ago",
      icon: "Database",
      details: "Query performance optimal with 12ms average response time"
    }
  ];

  const configurations = {
    google_sheets: {
      api_key: "AIzaSyC8X9mK2pL4nR6tY8uV3wZ1qA5bC7dE9fG",
      spreadsheet_id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      sheet_name: "Lead_Database_2026"
    },
    n8n_webhook: {
      webhook_url: "https://n8n.company.com/webhook/lead-scraper-v2",
      api_token: "n8n_prod_8k9m2p4r6t8v1x3z5b7d9f1h3j5l7n9",
      timeout_seconds: "30"
    },
    email_service: {
      smtp_host: "smtp.sendgrid.net",
      smtp_port: "587",
      api_key: "SG.xY9zA8bC7dE6fG5hI4jK3lM2nO1pQ0rS",
      sender_email: "outreach@company.com"
    }
  };

  const systemLogs = [
    {
      id: 1,
      type: "api",
      severity: "info",
      timestamp: "02/09/2026 06:25:18",
      message: "Google Sheets API: Successfully synced 247 lead records from spreadsheet"
    },
    {
      id: 2,
      type: "webhook",
      severity: "info",
      timestamp: "02/09/2026 06:23:45",
      message: "Webhook: Received scraping completion notification for Technology sector"
    },
    {
      id: 3,
      type: "error",
      severity: "warning",
      timestamp: "02/09/2026 06:22:10",
      message: "Email Service: Delivery delayed for batch #8472 - retry scheduled in 5 minutes"
    },
    {
      id: 4,
      type: "sync",
      severity: "info",
      timestamp: "02/09/2026 06:20:33",
      message: "Data Sync: Lead quality scores updated for 189 contacts based on engagement data"
    },
    {
      id: 5,
      type: "api",
      severity: "error",
      timestamp: "02/09/2026 06:18:52",
      message: "Google Sheets API: Rate limit warning - 85% of quota consumed for current hour"
    },
    {
      id: 6,
      type: "webhook",
      severity: "info",
      timestamp: "02/09/2026 06:15:27",
      message: "Webhook: Campaign trigger executed successfully for Healthcare vertical"
    },
    {
      id: 7,
      type: "sync",
      severity: "critical",
      timestamp: "02/09/2026 06:12:08",
      message: "Data Sync: Duplicate detection identified 23 potential duplicate records requiring review"
    },
    {
      id: 8,
      type: "api",
      severity: "info",
      timestamp: "02/09/2026 06:10:45",
      message: "Email Service API: Bounce rate analysis completed - 2.3% bounce rate within acceptable range"
    }
  ];

  const performanceMetrics = [
    {
      label: "Avg Response Time",
      value: "142",
      unit: "ms",
      icon: "Zap",
      change: -8
    },
    {
      label: "API Success Rate",
      value: "99.2",
      unit: "%",
      icon: "CheckCircle2",
      change: 0.5
    },
    {
      label: "Data Sync Status",
      value: "Active",
      unit: "",
      icon: "RefreshCw",
      change: null
    },
    {
      label: "Error Rate",
      value: "0.8",
      unit: "%",
      icon: "AlertTriangle",
      change: 0.3
    }
  ];

  const chartData = {
    responseTime: [
      { time: "00:00", google_sheets: 120, n8n_webhook: 145, email_service: 180 },
      { time: "04:00", google_sheets: 135, n8n_webhook: 152, email_service: 195 },
      { time: "08:00", google_sheets: 158, n8n_webhook: 168, email_service: 210 },
      { time: "12:00", google_sheets: 142, n8n_webhook: 155, email_service: 188 },
      { time: "16:00", google_sheets: 128, n8n_webhook: 148, email_service: 175 },
      { time: "20:00", google_sheets: 138, n8n_webhook: 158, email_service: 192 },
      { time: "Now", google_sheets: 142, n8n_webhook: 162, email_service: 198 }
    ],
    errorRate: [
      { time: "00:00", errors: 2 },
      { time: "04:00", errors: 1 },
      { time: "08:00", errors: 5 },
      { time: "12:00", errors: 3 },
      { time: "16:00", errors: 2 },
      { time: "20:00", errors: 4 },
      { time: "Now", errors: 3 }
    ]
  };

  const backupData = [
    {
      id: 1,
      name: "Daily Automated Backup",
      status: "completed",
      date: "02/09/2026 02:00 AM",
      size: "2.4 GB",
      records: "15,847"
    },
    {
      id: 2,
      name: "Critical Data Backup",
      status: "completed",
      date: "02/09/2026 12:00 AM",
      size: "1.8 GB",
      records: "12,394"
    },
    {
      id: 3,
      name: "Weekly Full Backup",
      status: "completed",
      date: "02/08/2026 02:00 AM",
      size: "3.1 GB",
      records: "18,562"
    },
    {
      id: 4,
      name: "Manual Backup - Pre-Migration",
      status: "completed",
      date: "02/07/2026 03:45 PM",
      size: "2.9 GB",
      records: "17,238"
    }
  ];

  const tabs = [
    { id: 'google_sheets', label: 'Google Sheets', icon: 'FileSpreadsheet' },
    { id: 'n8n_webhook', label: 'Webhook', icon: 'Webhook' },
    { id: 'email_service', label: 'Email Service', icon: 'Mail' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header />

        <main className="p-4 md:p-6 lg:p-8">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Settings Dashboard
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              System health monitoring and API configuration management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {systemStatus?.map((status, index) => (
              <div key={index} className="animate-stagger">
                <StatusCard {...status} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">
                  API Configuration
                </h2>
                
                <div className="flex flex-wrap gap-2 mb-6 border-b border-border">
                  {tabs?.map((tab) => (
                    <button
                      key={tab?.id}
                      onClick={() => setActiveTab(tab?.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-250 border-b-2 ${
                        activeTab === tab?.id
                          ? 'text-primary border-primary' :'text-muted-foreground border-transparent hover:text-foreground'
                      }`}
                    >
                      <span>{tab?.label}</span>
                    </button>
                  ))}
                </div>

                <ConfigurationPanel
                  title={tabs?.find(t => t?.id === activeTab)?.label}
                  icon={tabs?.find(t => t?.id === activeTab)?.icon}
                  config={configurations?.[activeTab]}
                  onTest={() => {}}
                  onSave={() => {}}
                />
              </div>

              <PerformanceMetrics metrics={performanceMetrics} chartData={chartData} />
            </div>

            <div className="space-y-4 md:space-y-6">
              <SystemLogViewer logs={systemLogs} />
            </div>
          </div>

          <BackupStatus backups={backupData} />
        </main>
      </div>
    </div>
  );
};

export default SettingsDashboard;