export interface Judgment {
  id: string;
  title: string;
  case_number: string;
  date_of_order: string;
  court_name: string;
  status: string;
  original_filename: string;
}

export interface Task {
  id: string;
  judgment_id: string;
  action: string;
  department: string;
  deadline: string;
  deliverable: string;
  confidence: string;
  reasoning: string;
  source_text: string;
  page: number;
  urgency: string;
  impact: string;
  status: 'draft' | 'approved' | 'rejected';
  last_note?: string;
  created_at: string;
}

const API_BASE = '/api';

export const api = {
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  },

  async uploadJudgment(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/judgments/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Upload failed');
    }
    return res.json();
  },

  async createJudgment(data: { title?: string, original_filename?: string }) {
    const res = await fetch(`${API_BASE}/judgments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to initialize judgment record');
    return res.json();
  },

  async updateJudgment(id: string, data: Partial<Judgment>) {
    const res = await fetch(`${API_BASE}/judgments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async saveTasks(tasks: any[]) {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tasks)
    });
    return res.json();
  },

  async getTasks(status?: string, department?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (department) params.append('department', department);
    const res = await fetch(`${API_BASE}/tasks?${params}`);
    return res.json();
  },

  async getDeptStats() {
    const res = await fetch(`${API_BASE}/stats/departments`);
    return res.json();
  },

  async verifyTask(id: string, status: string, user_email: string, updates: Partial<Task> = {}) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, user_email, ...updates })
    });
    return res.json();
  },

  async deleteTask(id: string) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Deletion failed');
    return res.json();
  }
};
