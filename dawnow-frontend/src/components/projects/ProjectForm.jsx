import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Upload, X, FileText } from 'lucide-react';

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA', 'MCA', 'Other'];
const STATUSES = ['Prepared', 'Submitted', 'Revision', 'Accepted', 'Published'];

const statusDotColors = {
    Prepared: 'bg-blue-500',
    Submitted: 'bg-yellow-500',
    Revision: 'bg-orange-500',
    Accepted: 'bg-green-500',
    Published: 'bg-purple-500',
};

const emptyForm = {
    projectTitle: '',
    principalInvestigator: '',
    coInvestigator: '',
    department: '',
    institution: '',
    description: '',
    startDate: null,
    endDate: null,
    fundingAgency: '',
    fundingScheme: '',
    grantReferenceNumber: '',
    amountSanctioned: '',
    amountReceived: '',
    status: 'Prepared',
    statusRemarks: '',
    submissionDate: null,
};

const ProjectForm = ({ initialData, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState(emptyForm);
    const [files, setFiles] = useState({
        projectReport: null,
        sanctionLetter: null,
        completionCertificate: null,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                projectTitle: initialData.projectTitle || '',
                principalInvestigator: initialData.principalInvestigator || '',
                coInvestigator: initialData.coInvestigator || '',
                department: initialData.department || '',
                institution: initialData.institution || '',
                description: initialData.description || '',
                startDate: initialData.startDate ? new Date(initialData.startDate) : null,
                endDate: initialData.endDate ? new Date(initialData.endDate) : null,
                fundingAgency: initialData.fundingAgency || '',
                fundingScheme: initialData.fundingScheme || '',
                grantReferenceNumber: initialData.grantReferenceNumber || '',
                amountSanctioned: initialData.amountSanctioned || '',
                amountReceived: initialData.amountReceived || '',
                status: initialData.status || 'Prepared',
                statusRemarks: initialData.statusRemarks || '',
                submissionDate: initialData.submissionDate ? new Date(initialData.submissionDate) : null,
            });
        } else {
            setFormData(emptyForm);
        }
    }, [initialData]);

    const amountPending = (parseFloat(formData.amountSanctioned) || 0) - (parseFloat(formData.amountReceived) || 0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleDateChange = (name, date) => {
        setFormData(prev => ({ ...prev, [name]: date }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e) => {
        const { name, files: fileList } = e.target;
        if (fileList[0]) {
            if (fileList[0].size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, [name]: 'File size must be less than 5MB' }));
                return;
            }
            if (fileList[0].type !== 'application/pdf') {
                setErrors(prev => ({ ...prev, [name]: 'Only PDF files are allowed' }));
                return;
            }
            setFiles(prev => ({ ...prev, [name]: fileList[0] }));
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const removeFile = (name) => {
        setFiles(prev => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.projectTitle.trim()) newErrors.projectTitle = 'Project title is required';
        if (!formData.principalInvestigator.trim()) newErrors.principalInvestigator = 'PI name is required';
        if (!formData.department) newErrors.department = 'Department is required';
        if (!formData.institution.trim()) newErrors.institution = 'Institution is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (formData.startDate && formData.endDate && formData.endDate <= formData.startDate) {
            newErrors.endDate = 'End date must be after start date';
        }
        if (!formData.fundingAgency.trim()) newErrors.fundingAgency = 'Funding agency is required';
        if (!formData.fundingScheme.trim()) newErrors.fundingScheme = 'Funding scheme is required';
        if (formData.amountSanctioned && parseFloat(formData.amountSanctioned) < 0) {
            newErrors.amountSanctioned = 'Amount cannot be negative';
        }
        if (formData.amountReceived && formData.amountSanctioned &&
            parseFloat(formData.amountReceived) > parseFloat(formData.amountSanctioned)) {
            newErrors.amountReceived = 'Received amount cannot exceed sanctioned amount';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== '') {
                if (key === 'startDate' || key === 'endDate' || key === 'submissionDate') {
                    submitData.append(key, formData[key]?.toISOString());
                } else {
                    submitData.append(key, formData[key]);
                }
            }
        });

        Object.keys(files).forEach(key => {
            if (files[key]) {
                submitData.append(key, files[key]);
            }
        });

        onSubmit(submitData);
    };

    const inputClass = (field) =>
        `w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

    const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';
    const errorText = (field) => errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>;

    const FileUploadField = ({ name, label, existingFile }) => (
        <div>
            <label className={labelClass}>{label}</label>
            {files[name] ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <FileText size={18} className="text-green-600" />
                    <span className="text-sm text-green-700 flex-1 truncate">{files[name].name}</span>
                    <button type="button" onClick={() => removeFile(name)} className="text-red-500 hover:text-red-700">
                        <X size={16} />
                    </button>
                </div>
            ) : existingFile ? (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <FileText size={18} className="text-blue-600" />
                    <span className="text-sm text-blue-700 flex-1 truncate">
                        {existingFile.split('/').pop()}
                    </span>
                    <label className="text-xs text-blue-600 cursor-pointer hover:underline">
                        Replace
                        <input
                            type="file"
                            name={name}
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                </div>
            ) : (
                <label className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-green hover:bg-green-50 transition-all">
                    <Upload size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-500">Upload PDF (max 5MB)</span>
                    <input
                        type="file"
                        name={name}
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>
            )}
            {errorText(name)}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Basic Project Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-green/10 rounded-lg flex items-center justify-center text-primary-green text-sm font-bold">1</span>
                    Basic Project Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className={labelClass}>Project Title *</label>
                        <input type="text" name="projectTitle" value={formData.projectTitle} onChange={handleChange} className={inputClass('projectTitle')} placeholder="Enter project title" />
                        {errorText('projectTitle')}
                    </div>
                    <div>
                        <label className={labelClass}>Principal Investigator (PI) *</label>
                        <input type="text" name="principalInvestigator" value={formData.principalInvestigator} onChange={handleChange} className={inputClass('principalInvestigator')} placeholder="PI name" />
                        {errorText('principalInvestigator')}
                    </div>
                    <div>
                        <label className={labelClass}>Co-Investigator</label>
                        <input type="text" name="coInvestigator" value={formData.coInvestigator} onChange={handleChange} className={inputClass('coInvestigator')} placeholder="Co-investigator name (optional)" />
                    </div>
                    <div>
                        <label className={labelClass}>Department *</label>
                        <select name="department" value={formData.department} onChange={handleChange} className={inputClass('department')}>
                            <option value="">Select Department</option>
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        {errorText('department')}
                    </div>
                    <div>
                        <label className={labelClass}>Institution / College Name *</label>
                        <input type="text" name="institution" value={formData.institution} onChange={handleChange} className={inputClass('institution')} placeholder="Institution name" />
                        {errorText('institution')}
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClass}>Project Description *</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={inputClass('description')} placeholder="Describe the project..." />
                        {errorText('description')}
                    </div>
                    <div>
                        <label className={labelClass}>Project Start Date *</label>
                        <DatePicker
                            selected={formData.startDate}
                            onChange={(date) => handleDateChange('startDate', date)}
                            dateFormat="dd/MM/yyyy"
                            className={inputClass('startDate')}
                            placeholderText="Select start date"
                        />
                        {errorText('startDate')}
                    </div>
                    <div>
                        <label className={labelClass}>Project End Date *</label>
                        <DatePicker
                            selected={formData.endDate}
                            onChange={(date) => handleDateChange('endDate', date)}
                            dateFormat="dd/MM/yyyy"
                            className={inputClass('endDate')}
                            placeholderText="Select end date"
                            minDate={formData.startDate}
                        />
                        {errorText('endDate')}
                    </div>
                </div>
            </div>

            {/* Section 2: Funding Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-green/10 rounded-lg flex items-center justify-center text-primary-green text-sm font-bold">2</span>
                    Funding Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className={labelClass}>Funding Agency Name *</label>
                        <input type="text" name="fundingAgency" value={formData.fundingAgency} onChange={handleChange} className={inputClass('fundingAgency')} placeholder="e.g., DST, SERB, AICTE" />
                        {errorText('fundingAgency')}
                    </div>
                    <div>
                        <label className={labelClass}>Funding Scheme / Title *</label>
                        <input type="text" name="fundingScheme" value={formData.fundingScheme} onChange={handleChange} className={inputClass('fundingScheme')} placeholder="Scheme name" />
                        {errorText('fundingScheme')}
                    </div>
                    <div>
                        <label className={labelClass}>Grant Reference Number</label>
                        <input type="text" name="grantReferenceNumber" value={formData.grantReferenceNumber} onChange={handleChange} className={inputClass('grantReferenceNumber')} placeholder="Reference number" />
                    </div>
                    <div></div>
                    <div>
                        <label className={labelClass}>Amount Sanctioned (&#8377;) *</label>
                        <input type="number" name="amountSanctioned" value={formData.amountSanctioned} onChange={handleChange} className={inputClass('amountSanctioned')} placeholder="0" min="0" />
                        {errorText('amountSanctioned')}
                    </div>
                    <div>
                        <label className={labelClass}>Amount Received (&#8377;)</label>
                        <input type="number" name="amountReceived" value={formData.amountReceived} onChange={handleChange} className={inputClass('amountReceived')} placeholder="0" min="0" />
                        {errorText('amountReceived')}
                    </div>
                    <div>
                        <label className={labelClass}>Amount Pending (&#8377;)</label>
                        <input
                            type="text"
                            value={`₹ ${amountPending.toLocaleString('en-IN')}`}
                            readOnly
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">Auto calculated: Sanctioned - Received</p>
                    </div>
                </div>
            </div>

            {/* Section 3: Submission Status */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-green/10 rounded-lg flex items-center justify-center text-primary-green text-sm font-bold">3</span>
                    Submission Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className={labelClass}>Current Status *</label>
                        <select name="status" value={formData.status} onChange={handleChange} className={inputClass('status')}>
                            {STATUSES.map(s => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Submission Date</label>
                        <DatePicker
                            selected={formData.submissionDate}
                            onChange={(date) => handleDateChange('submissionDate', date)}
                            dateFormat="dd/MM/yyyy"
                            className={inputClass('submissionDate')}
                            placeholderText="Select submission date"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClass}>Status Remarks</label>
                        <textarea name="statusRemarks" value={formData.statusRemarks} onChange={handleChange} rows={3} className={inputClass('statusRemarks')} placeholder="Reason or notes for current status..." />
                    </div>
                </div>
            </div>

            {/* Section 4: Document Upload */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-green/10 rounded-lg flex items-center justify-center text-primary-green text-sm font-bold">4</span>
                    Document Upload
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FileUploadField
                        name="projectReport"
                        label="Project Report (PDF)"
                        existingFile={initialData?.documents?.projectReport}
                    />
                    <FileUploadField
                        name="sanctionLetter"
                        label="Sanction Letter (PDF)"
                        existingFile={initialData?.documents?.sanctionLetter}
                    />
                    <FileUploadField
                        name="completionCertificate"
                        label="Completion Certificate (PDF, optional)"
                        existingFile={initialData?.documents?.completionCertificate}
                    />
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-primary-green text-white rounded-lg font-medium hover:bg-primary-green-dark shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : initialData ? 'Update Project' : 'Submit Project'}
                </button>
            </div>
        </form>
    );
};

export default ProjectForm;
