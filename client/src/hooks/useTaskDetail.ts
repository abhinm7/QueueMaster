import { useEffect, useState } from "react";
import type { Task } from "./useTasks";
import { apiClient } from "../api/client";

export interface TaskDetail extends Task {
    payload: any;
}

export const useTaskDetail = (taskId: string | null) => {
    const [task, setTask] = useState<TaskDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!taskId) {
            setTask(null);
            return
        }

        let isMounted = true;
        let pollInterval: ReturnType<typeof setInterval>;

        const fetchDetail = async () => {
            if (!isMounted) return;
            try {
                const { data } = await apiClient.get(`/tasks/${taskId}`);
                console.log("data:",data)
                setTask(data);

                if (data.status == 'COMPLETED' || data.status === 'FAILED') {
                    clearInterval(pollInterval);
                }

            } catch (error: any) {
                if (isMounted) {
                    setError('Failed to load task details');
                    clearInterval(pollInterval); // stop polling on hard errors
                }
            }
        }
        // first fetch
        setLoading(true);
        fetchDetail().finally(() => isMounted && setLoading(false));

        // poll every 2 seconds
        pollInterval = setInterval(() => {
            fetchDetail();
        }, 2000);

        return () => {
            isMounted = false;
            clearInterval(pollInterval);
        };

    }, [taskId]) // trigger when taskId changes

    return { task, loading, error };
}