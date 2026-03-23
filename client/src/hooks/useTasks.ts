import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { toast } from "sonner";

export interface Task {
    taskId: string;
    type: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    result?: string;
    createdAt: string;
}

interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const useTask = (page = 1, limit = 10) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await apiClient.get(`/tasks?page=${page}&limit=${limit}`);
            setTasks(data.data);
            setMeta(data.meta);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to fetch tasks';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [page, limit]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks])
}