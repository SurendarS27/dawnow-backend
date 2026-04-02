import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';
import {
    FileText, CheckCircle, XCircle, Search, Filter,
    ExternalLink, Trash2, Calendar, User, Database, Eye
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const DocumentVerification = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [verifyNote, setVerifyNote] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            console.log('Fetching documents from /api/documents/all');
            const res = await API.get('/documents/all');
            console.log('Documents received:', res.data);
            setDocuments(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching documents:', err.response || err);
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (isVerified) => {
        try {
            await API.patch(`/documents/${selectedDoc._id}/verify`, {
                isVerified,
                adminNote: verifyNote
            });
            toast.success(isVerified ? 'Document verified' : 'Document rejected');
            setIsVerifyModalOpen(false);
            setVerifyNote('');
            fetchDocuments();
        } catch (err) {
            toast.error('Operation failed');
        }
    };

    const filteredDocs = documents.filter(doc =>
        doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.staff?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.docType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Documents...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Research Verification</h1>
                    <p className="text-slate-500 text-sm">Review proof documents for publications and patents.</p>
                </div>
                <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                    <input
                        type="search"
                        placeholder="Search by staff, title, type..."
                        className="bg-transparent text-sm outline-none w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredDocs.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
                    <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">
                        {searchTerm ? `No documents found for "${searchTerm}"` : 'No documents uploaded yet'}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocs.map((doc) => (
                    <div key={doc._id} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                                <div className="bg-primary-green/10 p-2 rounded-lg">
                                    <FileText className="w-5 h-5 text-primary-green" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm truncate w-40">{doc.title}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{doc.docType}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                {doc.isVerified ? (
                                    <Badge variant="success">Verified</Badge>
                                ) : (
                                    <Badge variant="warning">Pending</Badge>
                                )}
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                                <div className="text-slate-500">
                                    <div className="flex items-center mb-1">
                                        <User className="w-3 h-3 mr-1 text-slate-400" />
                                        <span className="text-xs uppercase tracking-tighter">Staff Member</span>
                                    </div>
                                    <p className="text-slate-800">{doc.staff?.name || 'N/A'}</p>
                                </div>
                                <div className="text-slate-500">
                                    <div className="flex items-center mb-1">
                                        <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                                        <span className="text-xs uppercase tracking-tighter">Uploaded On</span>
                                    </div>
                                    <p className="text-slate-800">{new Date(doc.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <a
                                href={`${API.defaults.baseURL.replace('/api', '')}${doc.filePath}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full h-32 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 group-hover:border-primary-green/30 group-hover:bg-primary-green/5 transition-all"
                            >
                                <Eye className="w-6 h-6 mb-2" />
                                <span className="text-xs font-bold font-heading">CLICK TO PREVIEW</span>
                            </a>

                            <div className="flex space-x-2 pt-2">
                                <button
                                    onClick={() => { setSelectedDoc(doc); setIsVerifyModalOpen(true); }}
                                    className="flex-1 bg-primary-green text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center hover:bg-primary-green-dark transition-all"
                                >
                                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                    Review
                                </button>
                                <button className="w-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isVerifyModalOpen}
                onClose={() => setIsVerifyModalOpen(false)}
                title="Verify Proof Document"
            >
                <div className="space-y-6">
                    <div className="p-4 bg-slate-50 rounded-lg border text-sm">
                        <p className="font-bold text-slate-700 mb-1">Document: <span className="text-slate-500 font-medium">{selectedDoc?.title}</span></p>
                        <p className="font-bold text-slate-700">Staff: <span className="text-slate-500 font-medium">{selectedDoc?.staff?.name}</span></p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Internal Verification Note</label>
                        <textarea
                            className="w-full px-4 py-2 border rounded-lg h-24 text-sm focus:ring-2 focus:ring-primary-green/20 outline-none"
                            placeholder="Add notes for the staff member..."
                            value={verifyNote}
                            onChange={(e) => setVerifyNote(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => handleVerify(true)}
                            className="flex-1 bg-primary-green text-white font-bold py-2.5 rounded-lg flex items-center justify-center hover:bg-primary-green-dark transition-all"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Approve
                        </button>
                        <button
                            onClick={() => handleVerify(false)}
                            className="flex-1 bg-rose-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center hover:bg-rose-600 transition-all"
                        >
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DocumentVerification;
