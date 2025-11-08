import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { ArrowLeft, Save, Trash2, Link as LinkIcon } from 'lucide-react';
import { projectAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const DocumentForm = ({ 
  title,
  documentApi,
  fields,
  initialData = {},
  onSave,
  onDelete,
  backPath,
  allowProjectLinking = true
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState(initialData);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchDocument();
    }
    if (allowProjectLinking) {
      fetchProjects();
    }
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await documentApi.getById(id);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Failed to load document');
      navigate(backPath);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      if (isEdit) {
        await documentApi.update(id, formData);
        toast.success('Document updated successfully');
      } else {
        await documentApi.create(formData);
        toast.success('Document created successfully');
      }
      
      if (onSave) {
        onSave(formData);
      }
      
      navigate(backPath);
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentApi.delete(id);
      toast.success('Document deleted successfully');
      
      if (onDelete) {
        onDelete(id);
      }
      
      navigate(backPath);
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const renderField = (field) => {
    const { name, label, type = 'text', required, options, placeholder, ...fieldProps } = field;
    const value = formData[name] || '';

    switch (type) {
      case 'select':
        return (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleChange(name, e.target.value)}
              required={required}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2"
              {...fieldProps}
            >
              <option value="">Select {label}</option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'textarea':
        return (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleChange(name, e.target.value)}
              placeholder={placeholder}
              required={required}
              rows={3}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2"
              {...fieldProps}
            />
          </div>
        );

      case 'number':
        return (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="number"
              value={value}
              onChange={(e) => handleChange(name, parseFloat(e.target.value) || 0)}
              placeholder={placeholder}
              required={required}
              step="0.01"
              min="0"
              {...fieldProps}
            />
          </div>
        );

      default:
        return (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <Input
              type={type}
              value={value}
              onChange={(e) => handleChange(name, e.target.value)}
              placeholder={placeholder}
              required={required}
              {...fieldProps}
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to={backPath}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-400 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEdit ? `Edit ${title}` : `Create ${title}`}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isEdit ? 'Update document details' : 'Fill in the form to create a new document'}
            </p>
          </div>
        </div>

        {isEdit && (
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map(renderField)}

            {/* Project Linking */}
            {allowProjectLinking && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <LinkIcon className="h-4 w-4 inline mr-1" />
                  Link to Project
                </label>
                <select
                  value={formData.project_id || ''}
                  onChange={(e) => handleChange('project_id', e.target.value || null)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2"
                >
                  <option value="">No project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Optional: Link this document to a project for better organization
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? 'Update' : 'Create'} {title}
              </>
            )}
          </Button>
          
          <Link to={backPath}>
            <Button variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default DocumentForm;