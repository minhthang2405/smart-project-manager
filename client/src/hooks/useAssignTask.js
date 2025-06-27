// useAssignTask.js - Custom hook để giao task cho project
import { useState } from "react";

export function useAssignTask() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const assignTask = async ({ projectId, taskName, difficulty, estimatedTime, assignee, deadline }) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Validate input
        if (!projectId) {
            setLoading(false);
            setError("Thiếu thông tin dự án");
            return null;
        }

        if (!taskName) {
            setLoading(false);
            setError("Tên công việc không được để trống");
            return null;
        }

        if (!assignee) {
            setLoading(false);
            setError("Vui lòng chọn người nhận task");
            return null;
        }

        try {
            const res = await fetch(`http://localhost:5000/projects/${projectId}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: taskName,
                    difficulty,
                    estimatedTime,
                    assignee,
                    deadline,
                }),
            });

            if (!res.ok) {
                // Try to get more detailed error message from the server
                try {
                    const errorData = await res.json();
                    throw new Error(errorData.message || `Lỗi khi giao task (${res.status})`);
                } catch (jsonError) {
                    throw new Error(`Lỗi khi giao task (${res.status})`);
                }
            }

            const data = await res.json();
            setSuccess(true);
            return data;
        } catch (err) {
            console.error("Error assigning task:", err);
            setError(err.message || "Lỗi không xác định khi giao task");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { assignTask, loading, error, success };
}
