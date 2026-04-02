import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import ProjectForm from '../../components/projects/ProjectForm';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const SubmitProject = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');

    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    useEffect(() => {
        if (editId) {
            const fetchProject = async () => {
                setFetchLoading(true);
                try {
                    const res = await API.get(`/projects/${editId}`);
                    setInitialData(res.data);
                } catch (err) {
                    toast.error('Failed to load project');
                    navigate('/admin/projects');
                } finally {
                    setFetchLoading(false);
                }
            };
            fetchProject();
        }
    }, [editId, navigate]);

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            if (editId) {
                await API.put(`/projects/${editId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Project updated successfully');
            } else {
                await API.post('/projects', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Project submitted successfully');
            }
            navigate('/admin/projects');
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to save project';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green mb-4"></div>
                    <p className="text-gray-500">Loading project...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    {editId && (
                        <button
                            onClick={() => navigate('/admin/projects')}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <PlusCircle size={24} className="text-primary-green" />
                            {editId ? 'Edit Project' : 'Submit New Project'}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {editId ? 'Update project details and documents' : 'Fill in the project details to submit a new college project'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <ProjectForm
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/admin/projects')}
                loading={loading}
            />
        </div>
    );
};

export default SubmitProject;
