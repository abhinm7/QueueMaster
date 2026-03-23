import { useCallback, useEffect, useRef, useState } from "react";
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

    const prevTasksRef = useRef<Task[]>([]); // Holds the previous state to compare.

    const fetchTasks = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const { data } = await apiClient.get(`/tasks?page=${page}&limit=${limit}`);
            setTasks(data.data);
            setMeta(data.meta);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to fetch tasks';
            setError(msg);
            if (!silent) toast.error(msg);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [page, limit]);

    useEffect(() => {
    // Compare new tasks to the old tasks in the ref
    tasks.forEach((newTask) => {
      const oldTask = prevTasksRef.current.find((t) => t.taskId === newTask.taskId);
      
      if (oldTask && oldTask.status !== newTask.status) {
        if (newTask.status === 'COMPLETED') toast.success(`Task ${newTask.taskId.substring(0, 8)} completed!`);
        if (newTask.status === 'FAILED') toast.error(`Task ${newTask.taskId.substring(0, 8)} failed.`);
      }
    });

    // Update the ref for the next render
    prevTasksRef.current = tasks;
  }, [tasks]);

    // initial fetch
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // background polling for table
    useEffect(() => {
        const hasActiveTasks = tasks.some(
            (t) => t.status === 'PENDING' || t.status === 'PROCESSING'
        );
        if (!hasActiveTasks) return;

        const interval = setInterval(() => {
            fetchTasks(true);
        }, 3000);

        // Cleanup interval on unmount or when status changes
        return () => {
            clearInterval(interval);
        }   
    }, [tasks, fetchTasks]);


    return { tasks, meta, loading, error, refetch: () => fetchTasks(false) };
}