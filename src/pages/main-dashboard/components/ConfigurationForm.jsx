import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { apiPost } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

const ConfigurationForm = ({ onSubmit, dashboardData = {} }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    campaignType: '',
    industry: '',
    area: '',
    city: '',
    location: '',
    jobTitles: '',
    no_of_targets: '100'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingLeads, setPendingLeads] = useState([]);
  const [sentLeads, setSentLeads] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isApprovingSubmission, setIsApprovingSubmission] = useState(false);
  const [activeView, setActiveView] = useState('pending');
  const [currentCampaignId, setCurrentCampaignId] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [showList, setShowList] = useState(false);

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

    if (!formData?.name?.trim()) {
      newErrors.name = 'Please enter a campaign name';
    }

    if (!formData?.campaignType?.trim()) {
      newErrors.campaignType = 'Please enter a campaign type';
    }

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
    setShowForm(false);

    try {
      // 1. Resolve labels for the backend
      const industryLabel = industryOptions.find(o => o.value === formData.industry)?.label || formData.industry;
      const countryLabel = locationOptions.find(o => o.value === formData.location)?.label || formData.location;
      const jobTitlesArray = formData.jobTitles.split(',').map(t => t.trim()).filter(Boolean);

      // 2. Create campaign in database
      const campaignPayload = {
        name: formData.name,
        campaign_type: formData.campaignType,
        industry: industryLabel,
        area: formData.area || '',
        city: formData.city || '',
        state: '',
        country: countryLabel,
        job_titles: jobTitlesArray,
        requested_leads: parseInt(formData.no_of_targets) || 100,
        status: 'pending'
      };

      const campaignResult = await apiPost(`/campaigns/${user.user_id}`, campaignPayload);
      console.log('Campaign created:', campaignResult);

      const campaignId = campaignResult?.campaign?.id;
      setCurrentCampaignId(campaignId);

      // 3. Refresh dashboard to show "Started lead scraping" activity log
      if (typeof onSubmit === 'function') {
        onSubmit(formData, campaignResult);
      }

      // 4. Start n8n scraping
      const n8nPayload = {
        ...formData,
        campaign_id: campaignId,
        user_id: user.user_id
      };

      const resp = await fetch('https://n8n.analytica-data.com/webhook-test/form-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(n8nPayload)
      });

      let result = null;
      try { result = await resp.json(); } catch (_) { result = null; }

      if (!resp.ok) {
        console.error('Webhook responded with error', resp.status, result);
      } else {
        // 5. Map n8n employees to Lead format for /lead-scraping
        const batches = Array.isArray(result) ? result : [result];
        const employees = batches.flatMap(b => b.employees || []);

        if (employees.length > 0) {
          const leads = employees.map(emp => ({
            Employee_Name: emp.Employee_Name || emp.employee_name || '',
            Work_Email: emp.Work_Email || emp.work_email || null,
            Company: emp.Company || emp.company_name || emp.company || '',
            Work_Mobile_No: emp.Work_Mobile_No || emp.work_mobile_no || emp.phone || null,
            Category: emp.Category || emp.category || null,
            Position: emp.Position || emp.position || null,
            Email_Status: emp.Email_Status || emp.email_status || null,
            Website: emp.Website || emp.website || null,
            Domain: emp.Domain || emp.domain || null,
            Location: emp.Location || emp.location || null,
            Address: emp.Address || emp.address || null,
            Promotion_Status: emp.Promotion_Status || emp.promotion_status || null
          }));

          // 6. Insert leads via /lead-scraping endpoint
          const leadResult = await apiPost('/lead-scraping', {
            user_id: user.user_id,
            campaign_id: campaignId,
            leads
          });
          console.log('Leads inserted:', leadResult);

          // 7. Show inserted leads in pending list
          setPendingLeads(leadResult?.inserted_leads || []);
          setSelectedEmployees([]);
          setActiveView('pending');
          setShowForm(false);
          setShowList(true);

          // 8. Refresh dashboard to show "Leads scraped" activity log + updated KPIs
          if (typeof onSubmit === 'function') {
            onSubmit(formData, leadResult);
          }
        }
      }
    } catch (err) {
      console.error('Failed during campaign creation or scraping', err);
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
      // Collect selected leads from pending list
      const selectedLeadObjects = selectedEmployees
        .map(idx => pendingLeads[idx])
        .filter(Boolean);

      const approvalPayload = {
        user_id: user.user_id,
        campaign_id: currentCampaignId,
        type: 'sent',
        leads: selectedLeadObjects.map(lead => ({
          lead_id: lead.id,
          approved: true
        }))
      };

      const approveResult = await apiPost('/leads-approved', approvalPayload);
      console.log('Leads approved:', approveResult);

      // Use response's updated_leads to determine which leads were actually approved
      const approvedIds = new Set(
        (approveResult?.updated_leads || []).map(l => l.lead_id)
      );

      // Move only backend-confirmed approved leads from pending to sent
      const remainingPending = pendingLeads.filter(l => !approvedIds.has(l.id));
      const approvedLeadObjects = pendingLeads.filter(l => approvedIds.has(l.id));
      const newSent = [...sentLeads, ...approvedLeadObjects];

      setPendingLeads(remainingPending);
      setSentLeads(newSent);
      setSelectedEmployees([]);
      setActiveView('sent');
      setShowList(true);

      // Refresh dashboard to display activity log + updated KPIs
      if (typeof onSubmit === 'function') {
        onSubmit(formData, approveResult);
      }
    } catch (err) {
      console.error('Failed to approve submission', err);
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

  const hasLeads = pendingLeads.length > 0 || sentLeads.length > 0;

  // Handle toggle button clicks - always show list when clicked
  const handleToggleClick = (view) => {
    setActiveView(view);
    if (hasLeads) {
      setShowList(true);
      setShowForm(false);
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
        {hasLeads && showList && !isSubmitting && (
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
            disabled={!hasLeads}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeView === 'pending' && showList
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            } ${!hasLeads ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Pending ({pendingLeads.length})
          </button>
          <button
            onClick={() => handleToggleClick('sent')}
            disabled={!hasLeads}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeView === 'sent' && showList
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            } ${!hasLeads ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Sent ({sentLeads.length})
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
      {hasLeads && showList && !isSubmitting && (
        <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
            <div className="col-span-1 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="caption text-muted-foreground text-xs mb-2">Pending for Approval</p>
              <p className="text-3xl font-bold text-primary">
                {pendingLeads.length}
              </p>
            </div>
            <div className="col-span-1 bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 rounded-lg p-4">
              <p className="caption text-muted-foreground text-xs mb-2">Selected for Approval</p>
              <p className="text-3xl font-bold text-warning">
                {selectedEmployees.length}
              </p>
            </div>
          </div>

          {/* Lead List - Toggle between Pending and Sent */}
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
                            checked={selectedEmployees.length === pendingLeads.length && pendingLeads.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEmployees(pendingLeads.map((_, idx) => idx));
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
                      <>
                        {pendingLeads.map((lead, idx) => (
                          <tr key={lead.id || idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                checked={selectedEmployees.includes(idx)}
                                onChange={() => handleEmployeeSelect(idx)}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                                aria-label={`Select ${lead?.name}`}
                              />
                            </td>
                            <td className="px-3 py-2 text-sm text-foreground truncate">{lead?.name || '-'}</td>
                            <td className="px-3 py-2 text-sm text-muted-foreground truncate">{lead?.position || '-'}</td>
                            <td className="px-3 py-2 text-sm text-foreground truncate">{lead?.email || '-'}</td>
                            <td className="px-3 py-2 text-sm text-foreground truncate">{lead?.company || '-'}</td>
                          </tr>
                        ))}
                        {pendingLeads.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-3 py-4 text-sm text-muted-foreground text-center">No pending leads</td>
                          </tr>
                        )}
                      </>
                    ) : (
                      <>
                        {sentLeads.map((lead, idx) => (
                          <tr key={lead.id || idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="px-3 py-2 text-sm text-foreground truncate">{lead?.name || '-'}</td>
                            <td className="px-3 py-2 text-sm text-muted-foreground truncate">{lead?.position || '-'}</td>
                            <td className="px-3 py-2 text-sm text-foreground truncate">{lead?.email || '-'}</td>
                            <td className="px-3 py-2 text-sm text-foreground truncate">{lead?.company || '-'}</td>
                          </tr>
                        ))}
                        {sentLeads.length === 0 && (
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

          {/* Action Buttons */}
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
                setShowForm(true);
                setShowList(false);
                setSelectedEmployees([]);
                setActiveView('pending');
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
            <Input
              label="Campaign Name"
              type="text"
              placeholder="e.g., Education Outreach"
              value={formData?.name}
              onChange={(e) => handleInputChange('name', e?.target?.value)}
              error={errors?.name}
              required
            />

            <Input
              label="Campaign Type"
              type="text"
              placeholder="e.g., cold outreach, warm lead, partnership"
              value={formData?.campaignType}
              onChange={(e) => handleInputChange('campaignType', e?.target?.value)}
              error={errors?.campaignType}
              required
            />

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
                  name: '',
                  campaignType: '',
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