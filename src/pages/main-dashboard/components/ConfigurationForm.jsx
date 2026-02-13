import { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { apiGet, apiPost } from '../../../utils/api';

const ConfigurationForm = ({ onSubmit, dashboardData = {} }) => {
  const [formData, setFormData] = useState({
    industry: '',
    area: '',
    city: '',
    location: '',
    jobTitles: '',
    no_of_targets: '100'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrapingResults, setScrapingResults] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isApprovingSubmission, setIsApprovingSubmission] = useState(false);
  const [activeView, setActiveView] = useState('pending'); // 'pending' or 'sent'
  const [previousPendingCount, setPreviousPendingCount] = useState(0);
  const [showForm, setShowForm] = useState(true); // Always show form on refresh
  const [showList, setShowList] = useState(false); // Track if user wants to see the list

  // Load existing dashboard data on mount to enable toggle buttons
  useEffect(() => {
    if (dashboardData && dashboardData.total_leads_scraped > 0) {
      setScrapingResults(dashboardData);
      // Keep form visible, just load the data for toggle functionality
    }
  }, [dashboardData]);

  const industryOptions = [
    { value: 'technology', label: 'Technology & Software' },
    { value: 'healthcare', label: 'Healthcare & Medical' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'manufacturing', label: 'Manufacturing & Industrial' },
    { value: 'education', label: 'Education & Training' },
    { value: 'realestate', label: 'Real Estate & Construction' },
    { value: 'marketing', label: 'Marketing & Advertising' }
  ];

  const locationOptions = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'canada', label: 'Canada' },
    { value: 'australia', label: 'Australia' },
    { value: 'germany', label: 'Germany' },
    { value: 'india', label: 'India' },
    { value: 'singapore', label: 'Singapore' },
    { value: 'uae', label: 'United Arab Emirates' }
  ];

  

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.industry) {
      newErrors.industry = 'Please select an industry';
    }

    if (!formData?.location) {
      newErrors.location = 'Please select a location';
    }

    if (!formData?.jobTitles?.trim()) {
      newErrors.jobTitles = 'Please enter at least one job title';
    }

    const noOfTargets = parseInt(formData?.no_of_targets);
    if (!noOfTargets || noOfTargets < 1 || noOfTargets > 1000) {
      newErrors.no_of_targets = 'Number of targets must be between 1 and 1000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setShowForm(false); // Hide form during submission

    // Call onSubmit immediately to log scraping start
    if (typeof onSubmit === 'function') {
      onSubmit(formData, null);
    }

    try {
      const resp = await fetch('https://n8n.analytica-data.com/webhook-test/form-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      let result = null;
      try { result = await resp.json(); } catch (_) { result = null; }

      if (!resp.ok) {
        console.error('Webhook responded with error', resp.status, result);
      } else {
        // Send scraped employees to backend for storage and fetch updated dashboard
        let freshDashboardData = null;
        try {
          const batches = Array.isArray(result) ? result : [result];
          const employees = batches.flatMap(b => b.employees || []);
          if (employees.length > 0) {
            const storeResponse = await apiPost('/dashboard/scraped', { employees });
            console.log('Stored scraped:', storeResponse);

            // Fetch updated dashboard data to show pending list from backend
            freshDashboardData = await apiGet('/dashboard/dashboard');
            console.log('Refreshed dashboard:', freshDashboardData);

            // Track previous count to identify new employees
            setPreviousPendingCount(scrapingResults?.ready_to_email_number || 0);

            setScrapingResults(freshDashboardData);
            setSelectedEmployees([]);
            setActiveView('pending'); // Always show pending view after scraping
            setShowForm(false); // Keep form hidden after scraping
            setShowList(true); // Show the list after scraping

            // Call onSubmit with scraped results AND fresh dashboard data
            if (typeof onSubmit === 'function') {
              const totalScraped = (Array.isArray(result) ? result : [result]).reduce((sum, batch) => sum + (batch.total_scraped || 0), 0);
              onSubmit(formData, {
                scraped_data: result,
                total_scraped: totalScraped,
                freshDashboardData: freshDashboardData
              });
            }
          }
        } catch (err) {
          console.error('Failed to send scraped to backend', err);
          // apiPost/apiGet will handle 401 errors and redirect to login
        }
      }
    } catch (err) {
      console.error('Failed to POST form data to webhook', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmployeeSelect = (employeeIndex) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeIndex)) {
        return prev.filter(idx => idx !== employeeIndex);
      } else {
        return [...prev, employeeIndex];
      }
    });
  };

  const handleApproveSubmission = async () => {
    if (selectedEmployees.length === 0) {
      return;
    }

    setIsApprovingSubmission(true);

    try {
      // Collect selected employees from the pending list using indices
      const pendingList = scrapingResults?.ready_to_email_names || [];
      const selectedEmps = selectedEmployees.map(idx => pendingList[idx]).filter(emp => emp);

      const approvalData = {
        total_scraped: scrapingResults?.total_leads_scraped || 0,
        selected_employees: selectedEmps,
        submission_count: selectedEmps.length
      };

      // Send approval data to backend
      let freshDashboardData = null;

      if (approvalData?.selected_employees?.length > 0) {
        const approveData = await apiPost('/dashboard/approve', {
          approved_employees: approvalData.selected_employees
        });
        console.log('Approval stored:', approveData);

        // Fetch updated dashboard data after approval
        freshDashboardData = await apiGet('/dashboard/dashboard');
        console.log('Refreshed dashboard after approval:', freshDashboardData);

        // Update scrapingResults with fresh data (DON'T reset to null)
        setScrapingResults(freshDashboardData);

        // Clear selection since approved employees are now moved to sent
        setSelectedEmployees([]);

        // Stay on pending view after approval and keep list visible
        setActiveView('pending');
        setShowList(true);
      }

      if (typeof onSubmit === 'function') {
        onSubmit(formData, {
          approval_data: approvalData,
          freshDashboardData: freshDashboardData
        });
      }

      // DON'T reset form or scrapingResults - keep showing the results view
      // Only reset when "New Scraping" button is clicked
    } catch (err) {
      console.error('Failed to approve submission', err);
      if (typeof onSubmit === 'function') onSubmit(formData, { error: String(err) });
    } finally {
      setIsApprovingSubmission(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle toggle button clicks - always show list when clicked
  const handleToggleClick = (view) => {
    setActiveView(view);
    if (scrapingResults) {
      setShowList(true);
      setShowForm(false); // Hide form when viewing list
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm h-full flex flex-col">
      {/* Header row: state-dependent title + toggle buttons */}
      <div className="flex items-start justify-between mb-6">
        {/* Left: dynamic header based on state */}
        {showForm && !isSubmitting && (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/20 rounded-lg">
              <Icon name="Settings" size={20} color="var(--color-primary)" />
            </div>
            <div className="ml-3">
              <h2 className="text-lg md:text-xl font-semibold text-foreground">Lead Scraping Configuration</h2>
              <p className="caption text-muted-foreground text-xs md:text-sm">Configure your lead generation parameters</p>
            </div>
          </div>
        )}
        {scrapingResults && showList && !isSubmitting && (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-success/20 rounded-lg">
              <Icon name="CheckCircle2" size={20} color="var(--color-success)" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-foreground">
                {activeView === 'pending' ? 'Email Pending for Approval' : 'Emails Sent'}
              </h2>
              <p className="caption text-muted-foreground text-xs md:text-sm">
                {activeView === 'pending'
                  ? 'Select leads to approve for email sending'
                  : 'View all emails that have been sent'}
              </p>
            </div>
          </div>
        )}
        {isSubmitting && <div />}

        {/* Right: Toggle Buttons - always visible */}
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg shrink-0">
          <button
            onClick={() => handleToggleClick('pending')}
            disabled={!scrapingResults}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeView === 'pending' && showList
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            } ${!scrapingResults ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Pending ({scrapingResults?.ready_to_email_number || 0})
          </button>
          <button
            onClick={() => handleToggleClick('sent')}
            disabled={!scrapingResults}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeView === 'sent' && showList
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            } ${!scrapingResults ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Sent ({scrapingResults?.emails_sent_number || 0})
          </button>
        </div>
      </div>

      {/* Processing State */}
      {isSubmitting && (
        <div className="flex flex-col items-center justify-center py-12 flex-1">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-primary/10 rounded-full animate-spin" style={{
              borderTop: '3px solid var(--color-primary)',
              borderRight: 'transparent',
              borderBottom: 'transparent',
              borderLeft: 'transparent'
            }}></div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Scraping Leads...</h3>
          <p className="text-sm text-muted-foreground mb-2">This may take a few moments</p>
          <p className="caption text-xs text-muted-foreground">Processing: {formData?.no_of_targets} target leads</p>
        </div>
      )}

      {/* Results State - Only show when list is requested */}
      {scrapingResults && showList && !isSubmitting && (
        <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
          {/* Total Scraped Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
            <div className="col-span-1 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="caption text-muted-foreground text-xs mb-2">Pending for Approval</p>
              <p className="text-3xl font-bold text-primary">
                {scrapingResults?.ready_to_email_number || 0}
              </p>
            </div>
            <div className="col-span-1 bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 rounded-lg p-4">
              <p className="caption text-muted-foreground text-xs mb-2">Selected for Approval</p>
              <p className="text-3xl font-bold text-warning">
                {selectedEmployees.length}
              </p>
            </div>
          </div>

          {/* Employee List - Toggle between Pending and Sent */}
          <div className="mt-4">
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border sticky top-0">
                    <tr>
                      {activeView === 'pending' && (
                        <th className="px-3 py-2 text-left">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.length === (scrapingResults?.ready_to_email_names || []).length && (scrapingResults?.ready_to_email_names || []).length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEmployees((scrapingResults?.ready_to_email_names || []).map((_, idx) => idx));
                              } else {
                                setSelectedEmployees([]);
                              }
                            }}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                            aria-label="Select all"
                          />
                        </th>
                      )}
                      <th className="px-3 py-2 text-left text-xs text-muted-foreground">Name</th>
                      <th className="px-3 py-2 text-left text-xs text-muted-foreground">Position</th>
                      <th className="px-3 py-2 text-left text-xs text-muted-foreground">Email</th>
                      <th className="px-3 py-2 text-left text-xs text-muted-foreground">Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeView === 'pending' ? (
                      // Pending View - with checkboxes and NEW badges
                      <>
                        {(scrapingResults?.ready_to_email_names || []).map((emp, idx) => {
                          const isNew = idx < (scrapingResults?.ready_to_email_number || 0) - previousPendingCount;
                          return (
                            <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                              <td className="px-3 py-2">
                                <input
                                  type="checkbox"
                                  checked={selectedEmployees.includes(idx)}
                                  onChange={() => handleEmployeeSelect(idx)}
                                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                                  aria-label={`Select ${emp?.employee_name}`}
                                />
                              </td>
                              <td className="px-3 py-2 text-sm text-foreground truncate">
                                <div className="flex items-center gap-2">
                                  {emp?.employee_name || '-'}
                                  {isNew && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">
                                      NEW
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-2 text-sm text-muted-foreground truncate">{emp?.position || '-'}</td>
                              <td className="px-3 py-2 text-sm text-foreground truncate">{emp?.work_email || '-'}</td>
                              <td className="px-3 py-2 text-sm text-foreground truncate">{emp?.company_name || '-'}</td>
                            </tr>
                          );
                        })}
                        {(scrapingResults?.ready_to_email_names || []).length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-3 py-4 text-sm text-muted-foreground text-center">No pending leads</td>
                          </tr>
                        )}
                      </>
                    ) : (
                      // Sent View - without checkboxes
                      <>
                        {(scrapingResults?.email_sent_names || []).map((emp, idx) => (
                          <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="px-3 py-2 text-sm text-foreground truncate">{emp?.employee_name || '-'}</td>
                            <td className="px-3 py-2 text-sm text-muted-foreground truncate">{emp?.position || '-'}</td>
                            <td className="px-3 py-2 text-sm text-foreground truncate">{emp?.work_email || '-'}</td>
                            <td className="px-3 py-2 text-sm text-foreground truncate">{emp?.company_name || '-'}</td>
                          </tr>
                        ))}
                        {(scrapingResults?.email_sent_names || []).length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-3 py-4 text-sm text-muted-foreground text-center">No emails sent yet</td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>



          {/* Action Buttons - Only show in Pending view */}
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 pt-4">
            {activeView === 'pending' && (
              <Button
                type="button"
                variant="default"
                loading={isApprovingSubmission}
                iconName="CheckCircle2"
                iconPosition="left"
                onClick={handleApproveSubmission}
                disabled={selectedEmployees.length === 0}
                fullWidth
              >
                {isApprovingSubmission ? 'Approving...' : `Approve Selected (${selectedEmployees.length})`}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              iconName="RotateCcw"
              iconPosition="left"
              onClick={() => {
                setShowForm(true); // Show form for new scraping
                setShowList(false); // Hide list when starting new scraping
                setSelectedEmployees([]);
                setActiveView('pending');
                setPreviousPendingCount(0);
                // Keep scrapingResults so toggle is still visible
              }}
              className="sm:w-auto"
            >
              New Scraping
            </Button>
          </div>
        </div>
      )}

      {/* Form State - Show when showForm is true and not submitting */}
      {showForm && !isSubmitting && (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Target Industry"
              options={industryOptions}
              value={formData?.industry}
              onChange={(value) => handleInputChange('industry', value)}
              error={errors?.industry}
              required
              searchable
              placeholder="Choose an industry"
            />

            <Input
              label="Area"
              type="text"
              placeholder="Area (e.g., California, West Midlands)"
              value={formData?.area}
              onChange={(e) => handleInputChange('area', e?.target?.value)}
              error={errors?.area}
            />

            <Input
              label="City"
              type="text"
              placeholder="City (e.g., San Francisco)"
              value={formData?.city}
              onChange={(e) => handleInputChange('city', e?.target?.value)}
              error={errors?.city}
            />

            <Select
              label="Country"
              options={locationOptions}
              value={formData?.location}
              onChange={(value) => handleInputChange('location', value)}
              error={errors?.location}
              required
              searchable
              placeholder="Choose a location"
            />

            <Input
              label="Target Job Titles"
              type="text"
              placeholder="CEO, CTO, VP Sales, Marketing Director"
              value={formData?.jobTitles}
              onChange={(e) => handleInputChange('jobTitles', e?.target?.value)}
              error={errors?.jobTitles}
              required
            />

            <Input
              label="Number of Leads to Scrape"
              type="number"
              placeholder="100"
              value={formData?.no_of_targets}
              onChange={(e) => handleInputChange('no_of_targets', e?.target?.value)}
              error={errors?.no_of_targets}
              required
              min="1"
              max="1000"
            />

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              variant="default"
              loading={isSubmitting}
              iconName="Play"
              iconPosition="left"
              fullWidth
            >
              {isSubmitting ? 'Starting Scraping...' : 'Start Lead Scraping'}
            </Button>

            <Button
              type="button"
              variant="outline"
              iconName="RotateCcw"
              iconPosition="left"
              onClick={() => {
                setFormData({
                  industry: '',
                  area: '',
                  city: '',
                  location: '',
                  jobTitles: '',
                  no_of_targets: '100'
                });
                setErrors({});
              }}
              className="sm:w-auto"
            >
              Reset
            </Button>
          </div>
        </form>
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={16} color="var(--color-primary)" className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs md:text-sm text-foreground font-medium mb-1">Scraping Process</p>
              <p className="caption text-muted-foreground text-xs">
                Lead scraping typically takes 5-15 minutes depending on target count. You'll receive real-time updates in the activity feed.
              </p>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default ConfigurationForm;