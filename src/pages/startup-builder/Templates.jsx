import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Templates.module.css';
import { FileText, Trash2, Edit, Plus, Upload, Download, Eye, X, Image, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getAuthHeaders } from '@/utils/startupBuilderAuth';

const API_BASE_URL = import.meta.env.VITE_PAPLIXO_API_URL;

const Templates = () => {
    const { toast } = useToast();
    const [templates, setTemplates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [accessLevels, setAccessLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddTemplate, setShowAddTemplate] = useState(false);
    const [showViewTemplate, setShowViewTemplate] = useState(false);
    const [showEditTemplate, setShowEditTemplate] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [newTemplate, setNewTemplate] = useState({
        name: "",
        description: "",
        category: "",
        subCategory: "",
        accessLevel: "",
        content: "",
        file: null,
        previewImages: []
    });
    const [editTemplate, setEditTemplate] = useState({
        name: "",
        description: "",
        category: "",
        subCategory: "",
        accessLevel: "",
        content: "",
        file: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [showImageManager, setShowImageManager] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const getAuthHeadersLocal = (isMultipart = false) => {
        const headers = getAuthHeaders();
        if (Object.keys(headers).length === 0) {
            toast({
                title: 'Authentication Required',
                description: 'Please login to continue',
                variant: 'destructive',
            });
            return {};
        }
        if (isMultipart) {
            delete headers['Content-Type'];
        }
        return headers;
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeadersLocal();
            if (Object.keys(headers).length === 0) {
                setLoading(false);
                return;
            }

            // Load templates
            const templatesResponse = await fetch(`${API_BASE_URL}/api/admin/templates`, {
                headers
            });
            if (templatesResponse.ok) {
                const templatesData = await templatesResponse.json();
                setTemplates(templatesData.templates || []);
            }

            // Load categories
            const categoriesResponse = await fetch(`${API_BASE_URL}/api/admin/categories`, {
                headers
            });
            if (categoriesResponse.ok) {
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData.categories || []);
            }

            // Load access levels
            const accessLevelsResponse = await fetch(`${API_BASE_URL}/api/admin/access-levels`, {
                headers
            });
            if (accessLevelsResponse.ok) {
                const accessLevelsData = await accessLevelsResponse.json();
                setAccessLevels(accessLevelsData.accessLevels || []);
            }

            // Load all subcategories initially
            const subCategoriesResponse = await fetch(`${API_BASE_URL}/api/admin/subcategories`, {
                headers
            });
            if (subCategoriesResponse.ok) {
                const subCategoriesData = await subCategoriesResponse.json();
                setSubCategories(subCategoriesData.subCategories || []);
            }

        } catch (error) {
            console.error('Error loading data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({ title: 'File too large', description: 'Please select a file smaller than 5MB', variant: 'destructive' });
                return;
            }
            const allowedTypes = [
                'application/pdf', 'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain', 'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];
            if (!allowedTypes.includes(file.type)) {
                toast({ title: 'Invalid file type', description: 'Please select a PDF, Word, Excel, or text file', variant: 'destructive' });
                return;
            }
            setNewTemplate(prev => ({ ...prev, file: file }));
        }
    };

    const handlePreviewImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        const validImages = files.filter(file => {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                toast({ title: 'Invalid image type', description: `${file.name} is not supported`, variant: 'destructive' });
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast({ title: 'Image too large', description: `${file.name} exceeds 5MB limit`, variant: 'destructive' });
                return false;
            }
            return true;
        });
        if (validImages.length > 0) {
            setNewTemplate(prev => ({ ...prev, previewImages: [...(prev.previewImages || []), ...validImages] }));
            toast({ title: 'Images added', description: `Added ${validImages.length} preview image(s)` });
        }
    };

    const removePreviewImage = (index) => {
        setNewTemplate(prev => ({ ...prev, previewImages: prev.previewImages?.filter((_, i) => i !== index) || [] }));
    };

    const handleEditFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({ title: 'File too large', description: 'Please select a file smaller than 5MB', variant: 'destructive' });
                return;
            }
            const allowedTypes = [
                'application/pdf', 'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain', 'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];
            if (!allowedTypes.includes(file.type)) {
                toast({ title: 'Invalid file type', description: 'Please select a PDF, Word, Excel, or text file', variant: 'destructive' });
                return;
            }
            setEditTemplate(prev => ({ ...prev, file: file }));
        }
    };

    const handleAddTemplate = async () => {
        if (!newTemplate.name.trim() || !newTemplate.category || !newTemplate.accessLevel || !newTemplate.content.trim() || !newTemplate.file) {
            toast({ title: 'Validation Error', description: 'Please fill all required fields and upload a file', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', newTemplate.name.trim());
            formData.append('description', newTemplate.description || '');
            formData.append('category', newTemplate.category);
            if (newTemplate.subCategory?.trim()) formData.append('subCategory', newTemplate.subCategory);
            formData.append('accessLevel', newTemplate.accessLevel);
            formData.append('content', newTemplate.content.trim());
            formData.append('file', newTemplate.file);

            const headers = getAuthHeadersLocal(true);
            if (Object.keys(headers).length === 0) return;

            const response = await fetch(`${API_BASE_URL}/api/admin/templates`, {
                method: 'POST',
                headers,
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create template');
            }

            const templateData = await response.json();
            const createdTemplate = templateData.template;

            if (newTemplate.previewImages?.length > 0) {
                try {
                    await handleImageUpload(createdTemplate._id, newTemplate.previewImages);
                } catch (imageError) {
                    toast({ title: 'Template created', description: 'Template was created but images failed to upload', variant: 'default' });
                }
            }

            setNewTemplate({ name: "", description: "", category: "", subCategory: "", accessLevel: "", content: "", file: null, previewImages: [] });
            setShowAddTemplate(false);
            toast({ title: 'Success', description: 'Template created successfully' });
            loadAllData();
        } catch (error) {
            console.error('Error creating template:', error);
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditTemplate = async () => {
        if (!selectedTemplate || !editTemplate.name.trim() || !editTemplate.category || !editTemplate.accessLevel || !editTemplate.content.trim()) {
            toast({ title: 'Validation Error', description: 'Please fill all required fields', variant: 'destructive' });
            return;
        }

        setIsEditing(true);
        try {
            const formData = new FormData();
            formData.append('name', editTemplate.name.trim());
            formData.append('description', editTemplate.description || '');
            formData.append('category', editTemplate.category);
            if (editTemplate.subCategory?.trim()) formData.append('subCategory', editTemplate.subCategory);
            formData.append('accessLevel', editTemplate.accessLevel);
            formData.append('content', editTemplate.content.trim());
            if (editTemplate.file) formData.append('file', editTemplate.file);

            const headers = getAuthHeadersLocal(true);
            if (Object.keys(headers).length === 0) return;

            const response = await fetch(`${API_BASE_URL}/api/admin/templates/${selectedTemplate._id}`, {
                method: 'PUT',
                headers,
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setTemplates(prev => prev.map(template => template._id === selectedTemplate._id ? data.template : template));
                setShowEditTemplate(false);
                setSelectedTemplate(null);
                toast({ title: 'Success', description: 'Template updated successfully' });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update template');
            }
        } catch (error) {
            console.error('Error updating template:', error);
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsEditing(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        try {
            const headers = getAuthHeadersLocal();
            if (Object.keys(headers).length === 0) return;

            const response = await fetch(`${API_BASE_URL}/api/admin/templates/${id}`, {
                method: 'DELETE',
                headers,
            });

            if (response.ok) {
                setTemplates(prev => prev.filter(template => template._id !== id));
                toast({ title: 'Success', description: 'Template deleted successfully' });
            } else {
                throw new Error('Failed to delete template');
            }
        } catch (error) {
            console.error('Error deleting template:', error);
            toast({ title: 'Error', description: 'Failed to delete template', variant: 'destructive' });
        }
    };

    const handleImageUpload = async (templateId, images) => {
        try {
            setUploadingImages(true);
            const headers = getAuthHeadersLocal(true);
            if (Object.keys(headers).length === 0) return;

            const formData = new FormData();
            images.forEach(image => formData.append('images', image));

            const response = await fetch(`${API_BASE_URL}/api/admin/templates/${templateId}/images`, {
                method: 'POST',
                headers,
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload images');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            throw error;
        } finally {
            setUploadingImages(false);
        }
    };

    const handleDeleteImage = async (templateId, imageId) => {
        try {
            const headers = getAuthHeadersLocal();
            if (Object.keys(headers).length === 0) return;
            const response = await fetch(`${API_BASE_URL}/api/admin/templates/${templateId}/images/${imageId}`, {
                method: 'DELETE',
                headers,
            });
            if (response.ok) {
                toast({ title: 'Success', description: 'Image deleted successfully' });
                loadAllData();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete image');
            }
        } catch (error) {
            console.error('Delete image error:', error);
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleSetPrimaryImage = async (templateId, imageId) => {
        try {
            const headers = getAuthHeadersLocal();
            if (Object.keys(headers).length === 0) return;
            const response = await fetch(`${API_BASE_URL}/api/admin/templates/${templateId}/images/${imageId}/primary`, {
                method: 'PUT',
                headers,
            });
            if (response.ok) {
                toast({ title: 'Success', description: 'Primary image updated' });
                loadAllData();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to set primary image');
            }
        } catch (error) {
            console.error('Set primary image error:', error);
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleViewTemplate = (template) => {
        setSelectedTemplate(template);
        setShowViewTemplate(true);
    };

    const handleEditClick = (template) => {
        setSelectedTemplate(template);
        setEditTemplate({
            name: template.name,
            description: template.description || '',
            category: template.category?._id || template.category,
            subCategory: template.subCategory?._id || template.subCategory,
            accessLevel: template.accessLevel?._id || template.accessLevel,
            content: template.content,
            file: null
        });
        setShowEditTemplate(true);
    };

    const handleDownload = async (template) => {
        try {
            const headers = getAuthHeadersLocal();
            if (Object.keys(headers).length === 0) return;
            if (!template.file?.fileName) {
                toast({ title: 'No File', description: 'No file attached to this template', variant: 'destructive' });
                return;
            }
            const response = await fetch(`${API_BASE_URL}/api/admin/templates/${template._id}/download`, {
                headers,
                method: 'GET',
            });
            if (response.ok) {
                const blob = await response.blob();
                if (blob.size === 0) throw new Error('Downloaded file is empty');
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = template.file.fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast({ title: 'Download Started', description: `Downloading ${template.file.fileName}` });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to download file');
            }
        } catch (error) {
            console.error('Download error:', error);
            toast({ title: 'Download Failed', description: error.message, variant: 'destructive' });
        }
    };

    const handleInputChange = (field, value) => {
        setNewTemplate(prev => ({
            ...prev,
            [field]: value,
            ...(field === "category" && { subCategory: "" })
        }));
    };

    const handleEditInputChange = (field, value) => {
        setEditTemplate(prev => ({
            ...prev,
            [field]: value,
            ...(field === "category" && { subCategory: "" })
        }));
    };

    const getCategoryName = (categoryId) => {
        if (!categoryId) return '-';
        const catId = typeof categoryId === 'object' ? categoryId._id : categoryId;
        const find = categories.find(cat => cat._id === catId);
        return find ? find.name : '-';
    };

    const getSubCategoryName = (subCategoryId) => {
        if (!subCategoryId) return '-';
        const subId = typeof subCategoryId === 'object' ? subCategoryId._id : subCategoryId;
        const find = subCategories.find(sub => sub._id === subId);
        return find ? find.name : '-';
    };

    const getAccessLevelName = (accessLevel) => {
        if (!accessLevel) return '-';
        if (typeof accessLevel === 'object') return accessLevel.name || '-';
        const find = accessLevels.find(level => level._id === accessLevel);
        return find ? find.name : '-';
    };

    const getFilteredSubCategories = () => {
        if (!newTemplate.category) return [];
        return subCategories.filter(sub => {
            const catId = typeof sub.category === 'object' ? sub.category._id : sub.category;
            return catId === newTemplate.category;
        });
    };

    const getFilteredEditSubCategories = () => {
        if (!editTemplate.category) return [];
        return subCategories.filter(sub => {
            const catId = typeof sub.category === 'object' ? sub.category._id : sub.category;
            return catId === editTemplate.category;
        });
    };

    const getFileIcon = (fileName) => {
        if (!fileName) return <FileText className="w-4 h-4" />;
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
            case 'doc': case 'docx': return <FileText className="w-4 h-4 text-blue-500" />;
            case 'xls': case 'xlsx': return <FileText className="w-4 h-4 text-green-500" />;
            case 'txt': return <FileText className="w-4 h-4 text-gray-500" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown size';
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const ImageManagerModal = () => {
        if (!showImageManager || !selectedTemplate) return null;
        const images = selectedTemplate.imageUrls || [];
        const currentImage = images[currentImageIndex];
        const nextImage = () => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
        const prevImage = () => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);

        const handleFileUpload = async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;
            try {
                await handleImageUpload(selectedTemplate._id, files);
                toast({ title: 'Success', description: 'Images uploaded successfully' });
                e.target.value = '';
                loadAllData();
            } catch (error) { }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between p-6 border-b">
                        <h3 className="text-xl font-semibold">Manage Images - {selectedTemplate.name}</h3>
                        <Button variant="ghost" size="sm" onClick={() => setShowImageManager(false)}><X className="w-5 h-5" /></Button>
                    </div>
                    <div className="p-6">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Images</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" id="image-upload" disabled={uploadingImages} />
                                <label htmlFor="image-upload" className="cursor-pointer">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">{uploadingImages ? 'Uploading...' : 'Click to upload images'}</p>
                                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP, GIF (Max 5MB each)</p>
                                </label>
                            </div>
                        </div>
                        {images.length > 0 ? (
                            <div>
                                <h4 className="text-lg font-medium mb-4">Template Images ({images.length})</h4>
                                <div className="relative bg-gray-100 rounded-lg p-4 mb-4">
                                    {currentImage && (
                                        <div className="relative">
                                            <img src={currentImage.url} alt={currentImage.altText} className="max-w-full max-h-96 object-contain mx-auto rounded" />
                                            {images.length > 1 && (
                                                <>
                                                    <button onClick={prevImage} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"><ChevronLeft className="w-4 h-4" /></button>
                                                    <button onClick={nextImage} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"><ChevronRight className="w-4 h-4" /></button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <div className="text-center mt-2">
                                        <span className="text-sm text-gray-600">Image {currentImageIndex + 1} of {images.length} {currentImage?.isPrimary && <span className="ml-2 text-yellow-600"><Star className="w-3 h-3 inline fill-current" /> Primary</span>}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    {images.map((image, index) => (
                                        <div key={index} className={`relative border-2 rounded overflow-hidden cursor-pointer ${index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'}`} onClick={() => setCurrentImageIndex(index)}>
                                            <img src={image.thumbnail || image.url} alt={`Thumbnail ${index + 1}`} className="w-full h-20 object-cover" />
                                            {image.isPrimary && <div className="absolute top-1 left-1"><Star className="w-3 h-3 text-yellow-500 fill-current" /></div>}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => handleSetPrimaryImage(selectedTemplate._id, currentImage.fileId)} disabled={currentImage?.isPrimary}><Star className="w-4 h-4 mr-1" />Set as Primary</Button>
                                    <Button variant="destructive" onClick={() => { if (confirm('Are you sure?')) { handleDeleteImage(selectedTemplate._id, currentImage.fileId); if (currentImageIndex >= images.length - 1) setCurrentImageIndex(0); } }}><Trash2 className="w-4 h-4 mr-1" />Delete Image</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No images uploaded yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-16 h-16 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
                <div className="font-black text-slate-400 uppercase tracking-[0.2em] text-xs">Loading Templates...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerInner}>
                    <div className={styles.headerTitle}>
                        <div className={styles.iconWrapper}>
                            <FileText className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className={styles.titleMain}>Blueprint Library</h1>
                            <p className={styles.titleSub}>Curating and managing structural startup templates</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowAddTemplate(true)}
                        className="bg-black text-white rounded-2xl h-14 px-8 font-black shadow-xl shadow-sky-900/20 flex items-center justify-center transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Template
                    </Button>
                </div>
            </div>

            <div className={styles.grid}>
                {templates.map((template) => (
                    <div key={template._id} className={styles.templateCard}>
                        <div className={styles.cardPreview} onClick={() => handleViewTemplate(template)}>
                            {template.imageUrls?.length > 0 ? (
                                <img src={template.imageUrls.find(img => img.isPrimary)?.url || template.imageUrls[0].url} alt={template.name} />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                    <Image className="w-12 h-12" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">No Preview</span>
                                </div>
                            )}
                            <div className={styles.cardBadge}>
                                {getAccessLevelName(template.accessLevel)}
                            </div>
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>{template.name}</h3>
                            <p className="text-slate-300 text-white text-sm font-semibold line-clamp-2 mb-4 leading-relaxed">
                                {template.description || "Design and structure your next big thing with this comprehensive blueprint."}
                            </p>
                            <div className={styles.cardMeta}>
                                <span className={styles.metaItem}>{getCategoryName(template.category)}</span>
                                {template.subCategory && <span className={styles.metaItem}>{getSubCategoryName(template.subCategory)}</span>}
                                <span className={styles.metaItem}>{template.file ? template.file.fileName.split('.').pop()?.toUpperCase() : 'DOC'}</span>
                            </div>
                        </div>
                        <div className={styles.cardActions}>
                            <Button variant="outline" size="sm" className="flex-1 rounded-xl font-bold h-10 border-white/20 hover:bg-white/10 hover:text-white text-white bg-transparent" onClick={() => handleDownload(template)}>
                                <Download className="w-4 h-4 mr-2" /> Get
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 rounded-xl font-bold h-10 border-white/20 hover:bg-white/10 hover:text-white text-white bg-transparent" onClick={() => handleEditClick(template)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                            </Button>
                            <Button variant="outline" size="sm" className="flex-none w-10 h-10 p-0 rounded-xl border-white/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 bg-transparent" onClick={() => handleDelete(template._id)}>
                                <Trash2 className="w-4 h-4 text-white" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {showAddTemplate && (
                    <div className={styles.modalOverlay} onClick={() => setShowAddTemplate(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={styles.modalContent}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Create Template</h2>
                                    <Button variant="ghost" className="rounded-full w-12 h-12 p-0 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => setShowAddTemplate(false)}><X /></Button>
                                </div>
                                <div className={styles.formGrid}>
                                    <div className={`${styles.inputGroup} col-span-2`}>
                                        <label className={styles.label}>Template Title</label>
                                        <input className={`${styles.input} h-14 bg-white/5 border border-white/10 text-white rounded-2xl px-4 focus:ring-2 focus:ring-sky-500/50 outline-none`} value={newTemplate.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="e.g. Executive Summary v2" />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Domain / Category</label>
                                        <select
                                            className={`${styles.input} h-14 bg-white/5 border border-white/10 text-white rounded-2xl px-4 focus:ring-2 focus:ring-sky-500/50 outline-none appearance-none`}
                                            value={newTemplate.category}
                                            onChange={(e) => handleInputChange("category", e.target.value)}
                                        >
                                            <option value="" className="bg-slate-900 text-slate-400">Select Domain</option>
                                            {categories.map(cat => <option key={cat._id} value={cat._id} className="bg-slate-900 text-white">{cat.name}</option>)}
                                        </select>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Access Permisson</label>
                                        <select
                                            className={`${styles.input} h-14 bg-white/5 border border-white/10 text-white rounded-2xl px-4 focus:ring-2 focus:ring-sky-500/50 outline-none appearance-none`}
                                            value={newTemplate.accessLevel}
                                            onChange={(e) => handleInputChange("accessLevel", e.target.value)}
                                        >
                                            <option value="" className="bg-slate-900 text-slate-400">Select Level</option>
                                            {accessLevels.map(level => <option key={level._id} value={level._id} className="bg-slate-900 text-white">{level.name}</option>)}
                                        </select>
                                    </div>
                                    <div className={`${styles.inputGroup} col-span-2`}>
                                        <label className={styles.label}>Brief Description</label>
                                        <input className={`${styles.input} h-14 bg-white/5 border border-white/10 text-white rounded-2xl px-4 focus:ring-2 focus:ring-sky-500/50 outline-none`} value={newTemplate.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder="Short summary for the listing..." />
                                    </div>
                                    <div className={`${styles.inputGroup} col-span-2`}>
                                        <label className={styles.label}>Source Document</label>
                                        <div className={styles.fileDropzone} onClick={() => document.getElementById('file-upload').click()}>
                                            <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt,.xls,.xlsx" />
                                            <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                            <div className="font-black text-white text-lg">{newTemplate.file ? newTemplate.file.name : "Select or Drop Document"}</div>
                                            <div className="text-[10px] font-black text-white uppercase tracking-widest mt-1">PDF, DOCX, XLSX (Max 5MB)</div>
                                        </div>
                                    </div>
                                    <div className={`${styles.inputGroup} col-span-2`}>
                                        <label className={styles.label}>Template Essence (Content)</label>
                                        <textarea className={`${styles.textarea} bg-white/5 border border-white/10 text-white rounded-2xl p-4 focus:ring-2 focus:ring-sky-500/50 outline-none min-h-[150px]`} value={newTemplate.content} onChange={(e) => handleInputChange("content", e.target.value)} placeholder="Describe the template structure and components..." />
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-12 pt-2">
                                    <Button className="flex-1 h-16 rounded-2xl bg-black hover:bg-black/80 text-white font-black text-lg shadow-2xl shadow-sky-900/20 border-0 active:scale-95 transition-all" onClick={handleAddTemplate} disabled={isSubmitting}>
                                        {isSubmitting ? "Generating..." : "Finalize Template"}
                                    </Button>
                                    <Button variant="outline" className="h-16 mx-2 px-10 rounded-2xl border-white/20 text-white hover:bg-white/10 font-black bg-transparent" onClick={() => setShowAddTemplate(false)}>
                                        Discard
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {showEditTemplate && selectedTemplate && (
                    <div className={styles.modalOverlay} onClick={() => setShowEditTemplate(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={styles.modalContent}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Revise Blueprint</h2>
                                    <Button variant="ghost" className="rounded-full w-12 h-12 p-0 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => setShowEditTemplate(false)}><X /></Button>
                                </div>
                                <div className={styles.formGrid}>
                                    <div className={`${styles.inputGroup} col-span-2`}>
                                        <label className={styles.label}>Blueprint Title</label>
                                        <input className={styles.input} value={editTemplate.name} onChange={(e) => handleEditInputChange("name", e.target.value)} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Domain</label>
                                        <select className={styles.input} value={editTemplate.category} onChange={(e) => handleEditInputChange("category", e.target.value)}>
                                            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Permission</label>
                                        <select className={styles.input} value={editTemplate.accessLevel} onChange={(e) => handleEditInputChange("accessLevel", e.target.value)}>
                                            {accessLevels.map(level => <option key={level._id} value={level._id}>{level.name}</option>)}
                                        </select>
                                    </div>
                                    <div className={`${styles.inputGroup} col-span-2`}>
                                        <label className={styles.label}>Abstract (Content)</label>
                                        <textarea className={styles.textarea} value={editTemplate.content} onChange={(e) => handleEditInputChange("content", e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-12">
                                    <Button className="flex-1 h-16 rounded-2xl bg-gradient-to-r bg-black from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-lg shadow-2xl shadow-sky-900/20 border-0" onClick={handleEditTemplate} disabled={isEditing}>
                                        {isEditing ? "Syncing..." : "Publish Changes"}
                                    </Button>
                                    <Button variant="outline" className="h-16 mx-2 px-10 rounded-2xl border-white/20 text-white hover:bg-white/10 font-black bg-transparent" onClick={() => setShowEditTemplate(false)}>
                                        Abort
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ImageManagerModal />
        </div>
    );
};

export default Templates;
