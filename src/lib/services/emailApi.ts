// ═════════════════════════════════════════════════════════════════════════════════
// 📧 Email Notification - Frontend API Client
// ═════════════════════════════════════════════════════════════════════════════════

import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.caddcore.cloud/api";

// ════════════════════════════════════════════════════════════════════════════════════
// 📧 Send Bulk Email
// ════════════════════════════════════════════════════════════════════════════════════

export const sendBulkEmailApi = async (payload: {
  subject: string;
  content: string;
  htmlContent?: string;
  recipientType: "all" | "custom" | "specific";
  recipientEmails?: string[];
  metadata?: {
    category?: string;
    tags?: string[];
    notes?: string;
  };
}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/email/send`, payload);
    return response.data;
  } catch (error: any) {
    console.error("Error sending bulk email:", error);
    throw error.response?.data || error;
  }
};

// ════════════════════════════════════════════════════════════════════════════════════
// 🧪 Send Test Email
// ════════════════════════════════════════════════════════════════════════════════════

export const sendTestEmailApi = async (payload: {
  email: string;
  subject: string;
  message: string;
}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/email/send-test`,
      payload,
    );
    return response.data;
  } catch (error: any) {
    console.error("Error sending test email:", error);
    throw error.response?.data || error;
  }
};

// ════════════════════════════════════════════════════════════════════════════════════
// 📜 Get Email History
// ════════════════════════════════════════════════════════════════════════════════════

export const getEmailHistoryApi = async (
  page: number = 1,
  limit: number = 10,
  adminId?: string,
) => {
  try {
    const params: any = { page, limit };
    if (adminId) {
      params.adminId = adminId;
    }

    const response = await axios.get(`${API_BASE_URL}/email/history`, {
      params,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching email history:", error);
    throw error.response?.data || error;
  }
};

// ════════════════════════════════════════════════════════════════════════════════════
// 📋 Get Email Details
// ════════════════════════════════════════════════════════════════════════════════════

export const getEmailDetailsApi = async (emailId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/email/${emailId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching email details:", error);
    throw error.response?.data || error;
  }
};

// ════════════════════════════════════════════════════════════════════════════════════
// 📊 Get Email Statistics
// ════════════════════════════════════════════════════════════════════════════════════

export const getEmailStatsApi = async (adminId?: string) => {
  try {
    const params: any = {};
    if (adminId) {
      params.adminId = adminId;
    }

    const response = await axios.get(`${API_BASE_URL}/email/stats/overview`, {
      params,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching email statistics:", error);
    throw error.response?.data || error;
  }
};

// ════════════════════════════════════════════════════════════════════════════════════
// 👥 Get Recipients Preview
// ════════════════════════════════════════════════════════════════════════════════════

export const getRecipientsPreviewApi = async (payload: {
  recipientType: "all" | "custom" | "specific";
  recipientEmails?: string[];
}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/email/preview/recipients`,
      payload,
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching recipients preview:", error);
    throw error.response?.data || error;
  }
};

// ════════════════════════════════════════════════════════════════════════════════════
// Export all functions
// ════════════════════════════════════════════════════════════════════════════════════

export const emailApi = {
  sendBulkEmail: sendBulkEmailApi,
  sendTestEmail: sendTestEmailApi,
  getHistory: getEmailHistoryApi,
  getDetails: getEmailDetailsApi,
  getStats: getEmailStatsApi,
  getRecipientsPreview: getRecipientsPreviewApi,
};

export default emailApi;
