import axios from 'axios';

interface User {
  id: number;
  name: string;
}

interface IssueCountParams {
  statusId?: number[];
  createdUserId?: number[];
  assigneeId?: number[];
  minCreated?: string;
  maxCreated?: string;
}

const createBacklogApi = (backlogUrl: string, apiKey: string) => {
  const BACKLOG_API_BASE_URL = backlogUrl.endsWith('/api/v2') ? backlogUrl : `${backlogUrl}/api/v2`;
  return axios.create({
    baseURL: BACKLOG_API_BASE_URL,
    params: {
      apiKey: apiKey,
    },
  });
};

export const getMyself = async (backlogUrl: string, apiKey: string): Promise<User> => {
  try {
    const backlogApi = createBacklogApi(backlogUrl, apiKey);
    const response = await backlogApi.get('/users/myself');
    return response.data;
  } catch (error) {
    console.error('Error fetching myself:', error);
    throw error;
  }
};

export const getIssueCount = async (
  backlogUrl: string,
  apiKey: string,
  params: IssueCountParams
): Promise<number> => {
  try {
    const backlogApi = createBacklogApi(backlogUrl, apiKey);
    const response = await backlogApi.get('/issues/count', {
      params: {
        ...params,
        createdSince: '2025-01-01',
        createdUntil: '2025-12-31',
      },
    });
    return response.data.count;
  } catch (error) {
    console.error('Error fetching issue count:', error);
    throw error;
  }
};

export const getStarsCount = async (
  backlogUrl: string,
  apiKey: string,
  userId: number,
): Promise<number> => {
  try {
    const backlogApi = createBacklogApi(backlogUrl, apiKey);
    const response = await backlogApi.get(`/users/${userId}/stars/count`, {
      params: {
        since: '2025-01-01',
        until: '2025-12-31',
      },
    });
    return response.data.count;
  } catch (error) {
    console.error('Error fetching issue count:', error);
    throw error;
  }
};