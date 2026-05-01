// ═════════════════════════════════════════════════════════════════════════════════
// 📧 Email Management - Admin Panel Component (Redux Version)
// ═════════════════════════════════════════════════════════════════════════════════

'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send, Eye, Loader, ChevronDown, ChevronRight, X } from 'lucide-react';
import {
  useSendBulkEmailMutation,
  useSendTestEmailMutation,
  useGetEmailHistoryQuery,
  useGetEmailStatsQuery,
  useGetRecipientsPreviewMutation,
  useGetMembersByGroupQuery,
  IMemberInfo,
  IMemberGroup,
} from '@/app/redux/api/emailApi';
import { useAppSelector } from '@/app/redux/hooks';

// ════════════════════════════════════════════════════════════════════════════════════
// Member Type Definitions
// ════════════════════════════════════════════════════════════════════════════════════

type MemberType = 'M' | 'AM' | 'F' | 'all';

interface MemberFilterOption {
  value: MemberType;
  label: string;
  description: string;
  icon: string;
}

// ════════════════════════════════════════════════════════════════════════════════════
// Member Filter Options
// ════════════════════════════════════════════════════════════════════════════════════

const MEMBER_FILTERS: MemberFilterOption[] = [
  {
    value: 'all',
    label: 'All Members',
    description: 'Everyone (M, AM, F)',
    icon: '👥',
  },
  {
    value: 'M',
    label: 'Members (M)',
    description: 'Regular Members',
    icon: '👤',
  },
  {
    value: 'AM',
    label: 'Affiliate Members (AM)',
    description: 'Affiliate Members',
    icon: '🤝',
  },
  {
    value: 'F',
    label: 'Fellows (F)',
    description: 'Fellows Only',
    icon: '⭐',
  },
];

// ════════════════════════════════════════════════════════════════════════════════════
// Email Management Component
// ════════════════════════════════════════════════════════════════════════════════════

export const EmailManagementPage: React.FC = () => {
  // Redux Mutations & Queries
  const [sendBulkEmail, { isLoading: isSending }] = useSendBulkEmailMutation();
  const [sendTestEmail, { isLoading: isTestSending }] = useSendTestEmailMutation();
  const [getRecipientsPreview] = useGetRecipientsPreviewMutation();
  const { data: historyData, refetch: refetchHistory } = useGetEmailHistoryQuery({
    page: 1,
    limit: 10,
  });
  const { data: statsData } = useGetEmailStatsQuery(undefined);
  const { data: membersByGroupData, isLoading: isLoadingMembers } = useGetMembersByGroupQuery({});

  // Redux User State
  const user = useAppSelector((state: any) => state.auth?.user) || null;

  // State Management
  const [activeTab, setActiveTab] = useState('compose');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Expandable Groups State
  const [expandedGroups, setExpandedGroups] = useState<Set<MemberType | 'all'>>(new Set(['all']));
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [selectionTab, setSelectionTab] = useState<'groups' | 'manual'>('groups');

  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    htmlContent: '',
    selectionMethod: 'groups' as 'groups' | 'manual',
  });

  // Manual Email Input State
  const [manualEmails, setManualEmails] = useState<string[]>([]);
  const [manualEmailInput, setManualEmailInput] = useState('');

  // Test Email State
  const [testEmailData, setTestEmailData] = useState({
    email: '',
    subject: '',
    message: '',
  });

  // Recipients Preview State
  const [recipientsPreview, setRecipientsPreview] = useState<{
    count: number;
    recipients: IMemberInfo[];
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // ════════════════════════════════════════════════════════════════════════════════════
  // Toggle Group Expansion
  // ════════════════════════════════════════════════════════════════════════════════════

  const toggleGroupExpansion = (groupType: MemberType | 'all') => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupType)) {
      newExpanded.delete(groupType);
    } else {
      newExpanded.add(groupType);
    }
    setExpandedGroups(newExpanded);
  };

  // ════════════════════════════════════════════════════════════════════════════════════
  // Member Selection Handlers
  // ════════════════════════════════════════════════════════════════════════════════════

  const handleSelectMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSelectAllInGroup = (groupType: MemberType | 'all') => {
    const groupData = membersByGroupData?.data?.[groupType];
    if (!groupData) return;

    const newSelected = new Set(selectedMembers);
    const groupMemberIds = groupData.members.map((m: IMemberInfo) => m.id);
    
    // Check if all are already selected
    const allSelected = groupMemberIds.every((id: string) => newSelected.has(id));
    
    if (allSelected) {
      // Deselect all
      groupMemberIds.forEach((id: string) => newSelected.delete(id));
    } else {
      // Select all
      groupMemberIds.forEach((id: string) => newSelected.add(id));
    }
    
    setSelectedMembers(newSelected);
  };

  const handleClearSelection = () => {
    setSelectedMembers(new Set());
  };

  // ════════════════════════════════════════════════════════════════════════════════════
  // Get Selected Member Emails and Info
  // ════════════════════════════════════════════════════════════════════════════════════

  const getSelectedMembersInfo = () => {
    const members: IMemberInfo[] = [];

    const allGroupData = membersByGroupData?.data;
    if (!allGroupData) return members;

    // Collect from all groups
    (['all', 'M', 'AM', 'F'] as const).forEach(groupType => {
      const group = allGroupData[groupType];
      if (group?.members) {
        group.members.forEach((member: IMemberInfo) => {
          if (selectedMembers.has(member.id) && !members.find(m => m.id === member.id)) {
            members.push(member);
          }
        });
      }
    });

    return members;
  };

  const getRecipientEmails = () => {
    if (formData.selectionMethod === 'groups') {
      return getSelectedMembersInfo().map(m => m.email);
    } else {
      return manualEmails;
    }
  };

  // ════════════════════════════════════════════════════════════════════════════════════
  // Manual Email Handlers
  // ════════════════════════════════════════════════════════════════════════════════════

  const handleAddManualEmail = () => {
    const email = manualEmailInput.trim();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (!manualEmails.includes(email)) {
        setManualEmails([...manualEmails, email]);
        setManualEmailInput('');
      } else {
        alert('This email is already added');
      }
    } else {
      alert('Please enter a valid email address');
    }
  };

  const handleRemoveManualEmail = (email: string) => {
    setManualEmails(manualEmails.filter(e => e !== email));
  };

  // ════════════════════════════════════════════════════════════════════════════════════
  // Preview Recipients
  // ════════════════════════════════════════════════════════════════════════════════════

  const handlePreviewRecipients = async () => {
    try {
      setLoading(true);

      if (formData.selectionMethod === 'groups') {
        const selectedInfo = getSelectedMembersInfo();
        if (selectedInfo.length === 0) {
          alert('Please select at least one member');
          return;
        }

        setRecipientsPreview({
          count: selectedInfo.length,
          recipients: selectedInfo,
        });
      } else {
        if (manualEmails.length === 0) {
          alert('Please add at least one email address');
          return;
        }

        setRecipientsPreview({
          count: manualEmails.length,
          recipients: manualEmails.map(email => ({
            id: email,
            name: email,
            email: email,
            membershipId: 'manual'
          })),
        });
      }

      setShowPreview(true);
    } catch (error: any) {
      alert(error?.message || 'Failed to preview recipients');
    } finally {
      setLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════════════
  // Send Bulk Email
  // ════════════════════════════════════════════════════════════════════════════════════

  const handleSendEmail = async () => {
    // Validation
    if (!formData.subject.trim()) {
      alert('Please enter a subject');
      return;
    }

    if (!formData.content.trim()) {
      alert('Please enter email content');
      return;
    }

    const recipientEmails = getRecipientEmails();
    if (recipientEmails.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    try {
      const payload: any = {
        subject: formData.subject,
        content: formData.content,
        htmlContent: formData.htmlContent,
        recipientType: 'specific',
        recipientEmails: recipientEmails,
      };

      const response: any = await sendBulkEmail(payload).unwrap();

      if (response.success) {
        alert(`Email sent to ${response.data?.totalRecipients} recipients`);

        // Reset form
        setFormData({
          subject: '',
          content: '',
          htmlContent: '',
          selectionMethod: 'groups',
        });
        setSelectedMembers(new Set());
        setManualEmails([]);
        setShowPreview(false);

        // Refresh history
        refetchHistory();
      } else {
        alert(response.message || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      alert(error?.data?.message || error.message || 'Failed to send email');
    }
  };

  // ════════════════════════════════════════════════════════════════════════════════════
  // Send Test Email
  // ════════════════════════════════════════════════════════════════════════════════════

  const handleSendTestEmail = async () => {
    if (!testEmailData.email) {
      alert('Please enter an email address');
      return;
    }

    if (!testEmailData.subject) {
      alert('Please enter a subject');
      return;
    }

    if (!testEmailData.message) {
      alert('Please enter a message');
      return;
    }

    try {
      const response: any = await sendTestEmail(testEmailData).unwrap();

      if (response.success) {
        alert('Test email sent successfully');
        setTestEmailData({ email: '', subject: '', message: '' });
      }
    } catch (error: any) {
      alert(error?.data?.message || error.message || 'Failed to send test email');
    }
  };

  // ════════════════════════════════════════════════════════════════════════════════════
  // Render Status Badge
  // ════════════════════════════════════════════════════════════════════════════════════

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500">Sent</Badge>;
      case 'pending':
      case 'sending':
        return <Badge className="bg-blue-500">Sending</Badge>;
      case 'failed':
        return <Badge className="bg-red-800">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // ════════════════════════════════════════════════════════════════════════════════════
  // Render Member Group Row
  // ════════════════════════════════════════════════════════════════════════════════════

  const renderMemberGroup = (groupType: MemberType | 'all', group: IMemberGroup) => {
    const isExpanded = expandedGroups.has(groupType);
    const groupMembers = group.members || [];
    const selectedInGroup = groupMembers.filter(m => selectedMembers.has(m.id)).length;
    const allSelectedInGroup = groupMembers.length > 0 && selectedInGroup === groupMembers.length;

    return (
      <div key={groupType} className="border border-gray-200 rounded-lg mb-3">
        {/* Group Header */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
          onClick={() => toggleGroupExpansion(groupType)}>
          <button
            className="text-gray-600 hover:text-gray-900"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectAllInGroup(groupType);
            }}
          >
            <input
              type="checkbox"
              checked={allSelectedInGroup && groupMembers.length > 0}
              onChange={() => {}}
              className="w-5 h-5 cursor-pointer"
            />
          </button>

          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{group.icon}</span>
              <h3 className="font-semibold text-gray-900">{group.label}</h3>
              <Badge className="bg-blue-100 text-blue-800">{group.count}</Badge>
              {selectedInGroup > 0 && (
                <Badge className="bg-green-100 text-green-800">{selectedInGroup} selected</Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">{group.description}</p>
          </div>
        </div>

        {/* Group Members */}
        {isExpanded && (
          <div className="border-t border-gray-200 max-h-60 overflow-y-auto">
            {groupMembers.length > 0 ? (
              <div className="divide-y">
                {groupMembers.map((member: IMemberInfo) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedMembers.has(member.id)}
                      onChange={() => handleSelectMember(member.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{member.name}</p>
                      <p className="text-xs text-gray-600 truncate">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>No members in this group</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════════════════════
  // Render JSX
  // ════════════════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">📧 Email Management System</h1>
          <p className="text-gray-600 mt-1">Send personalized emails to BASE members in organized groups</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {activeTab === 'history' && (statsData as any)?.data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Emails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(statsData as any).data?.totalEmails || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Sent Successfully</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{(statsData as any).data?.sentEmails || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">{(statsData as any).data?.failedEmails || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('compose')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'compose'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ✍️ Compose
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'test'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🧪 Test
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'history'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📜 History
        </button>
      </div>

      {/* COMPOSE TAB */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Member Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Select Recipients</CardTitle>
                <CardDescription>Choose members by group or add manually</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selection Method Tabs */}
                <div className="flex gap-2 border-b">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, selectionMethod: 'groups' }))}
                    className={`px-3 py-2 text-sm font-medium transition ${
                      formData.selectionMethod === 'groups'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    👥 Groups
                  </button>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, selectionMethod: 'manual' }))}
                    className={`px-3 py-2 text-sm font-medium transition ${
                      formData.selectionMethod === 'manual'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    ✉️ Manual
                  </button>
                </div>

                {/* Groups Method */}
                {formData.selectionMethod === 'groups' && (
                  <div className="space-y-3">
                    {isLoadingMembers ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader className="w-5 h-5 animate-spin text-gray-600" />
                      </div>
                    ) : membersByGroupData?.data ? (
                      <>
                        {(['all', 'M', 'AM', 'F'] as const).map(groupType => {
                          const group = membersByGroupData.data[groupType];
                          return renderMemberGroup(groupType, group);
                        })}

                        {/* Clear Selection Button */}
                        {selectedMembers.size > 0 && (
                          <Button
                            onClick={handleClearSelection}
                            variant="outline"
                            className="w-full text-red-800 hover:text-red-700"
                          >
                            Clear Selection ({selectedMembers.size})
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <p>No members available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Method */}
                {formData.selectionMethod === 'manual' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Add Email Addresses</label>
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          value={manualEmailInput}
                          onChange={(e) => setManualEmailInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddManualEmail();
                            }
                          }}
                        />
                        <Button onClick={handleAddManualEmail} size="sm">
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Manual Emails List */}
                    {manualEmails.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">{manualEmails.length} email(s) added</p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {manualEmails.map((email) => (
                            <div key={email} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded">
                              <span className="text-sm text-gray-700 truncate">{email}</span>
                              <button
                                onClick={() => handleRemoveManualEmail(email)}
                                className="text-gray-400 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Count */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">
                    Selected: <span className="font-bold">{getRecipientEmails().length}</span> recipient(s)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Email Composition */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Compose Email</CardTitle>
                <CardDescription>Create and send bulk emails to selected members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Subject */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Subject</label>
                  <Input
                    placeholder="Enter email subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Message Content</label>
                  <Textarea
                    placeholder="Enter your email message"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                  />
                </div>

                {/* Preview Alert */}
                {showPreview && recipientsPreview && (
                  <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-md">
                    <p className="font-medium text-sm mb-2">
                      ✓ Preview: {recipientsPreview.count} total recipients
                    </p>
                    <div className="space-y-1">
                      {recipientsPreview.recipients.slice(0, 5).map((recipient, idx) => (
                        <p key={idx} className="text-xs text-gray-600">
                          • {recipient.name} ({recipient.email})
                        </p>
                      ))}
                      {recipientsPreview.recipients.length > 5 && (
                        <p className="text-xs text-gray-600">
                          • +{recipientsPreview.recipients.length - 5} more...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePreviewRecipients}
                    disabled={loading || isSending}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview ({getRecipientEmails().length})
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleSendEmail}
                    disabled={isSending || loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSending ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TEST TAB */}
      {activeTab === 'test' && (
        <Card>
          <CardHeader>
            <CardTitle>Test Email</CardTitle>
            <CardDescription>Send a test email before sending to all members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Test Email Address */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Test Email Address</label>
              <Input
                type="email"
                placeholder="Enter your test email address"
                value={testEmailData.email}
                onChange={(e) => setTestEmailData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            {/* Test Subject */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Subject</label>
              <Input
                placeholder="Enter test email subject"
                value={testEmailData.subject}
                onChange={(e) => setTestEmailData((prev) => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            {/* Test Message */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Message</label>
              <Textarea
                placeholder="Enter test email message"
                value={testEmailData.message}
                onChange={(e) => setTestEmailData((prev) => ({ ...prev, message: e.target.value }))}
                rows={6}
              />
            </div>

            {/* Send Test Button */}
            <Button
              onClick={handleSendTestEmail}
              disabled={isTestSending}
              className="w-full bg-green-600 hover:bg-black"
              size="lg"
            >
              {isTestSending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Email History</CardTitle>
            <CardDescription>View all sent emails and delivery status</CardDescription>
          </CardHeader>
          <CardContent>
            {(historyData as any)?.data?.data && (historyData as any).data.data.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-2 font-semibold">Subject</th>
                        <th className="text-left py-3 px-2 font-semibold">Recipients</th>
                        <th className="text-left py-3 px-2 font-semibold">Sent</th>
                        <th className="text-left py-3 px-2 font-semibold">Failed</th>
                        <th className="text-left py-3 px-2 font-semibold">Status</th>
                        <th className="text-left py-3 px-2 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(historyData as any).data.data.map((email: any) => (
                        <tr key={email._id} className="border-b hover:bg-gray-50">
                          <td className="font-medium py-3 px-2">{email.subject}</td>
                          <td className="py-3 px-2">{email.recipientCount}</td>
                          <td className="text-green-600 py-3 px-2">{email.sentCount}</td>
                          <td className="text-red-800 py-3 px-2">{email.failedCount}</td>
                          <td className="py-3 px-2">{getStatusBadge(email.status)}</td>
                          <td className="py-3 px-2">
                            {new Date(email.sentAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {(historyData as any).data.total > 10 && (
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-600">
                      Page {currentPage} of {Math.ceil((historyData as any).data.total / 10)}
                    </p>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={currentPage * 10 >= (historyData as any).data.total}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-gray-500 py-8">No emails sent yet</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailManagementPage;
