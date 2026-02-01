import { get } from './client';

export interface Stats {
  totalPosts: number;
  totalViews: number;
  totalUsers: number;
  totalComments: number;
  topPosts: Array<{
    _id: string;
    title: string;
    views: number;
  }>;
  allPosts: Array<{
    _id: string;
    title: string;
    subtitle?: string;
    views: number;
    commentCount: number;
    createdAt: string;
  }>;
}

export const fetchStats = async (): Promise<Stats> => {
  return get<Stats>('api/stats');
};
