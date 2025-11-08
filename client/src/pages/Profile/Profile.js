import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Shield, Building2, Upload, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Badge from '../../components/UI/Badge';
import PasswordStrengthIndicator from '../../components/UI/PasswordStrengthIndicator';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI, userAPI, companyAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { validateEmail, validatePassword, validateName } from '../../utils/validation';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [companyData, setCompanyData] = useState({
    name: '',
    country: '',
    address: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });

      if (user.company) {
        setCompanyData({
          name: user.company.name || '',
          country: user.company.country || '',
          address: user.company.address || ''
        });
        
        if (user.company.logo) {
          setLogoPreview(`http://localhost:5000${user.company.logo}`);
        }
      }
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyData({ ...companyData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    const firstNameValidation = validateName(profileData.firstName, 'First name');
    if (!firstNameValidation.isValid) {
      newErrors.firstName = firstNameValidation.message;
    }

    const lastNameValidation = validateName(profileData.lastName, 'Last name');
    if (!lastNameValidation.isValid) {
      newErrors.lastName = lastNameValidation.message;
    }

    if (!profileData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.update(user.id, profileData);
      updateUser(response.data.user || profileData);
      toast.success('Profile updated successfully');
      setErrors({});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    const passwordValidation = validatePassword(passwordData.newPassword);
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!passwordValidation.isValid) {
      const missing = [];
      if (!passwordValidation.hasMinLength) missing.push('at least 8 characters');
      if (!passwordValidation.hasUpperCase) missing.push('one uppercase letter');
      if (!passwordValidation.hasLowerCase) missing.push('one lowercase letter');
      if (!passwordValidation.hasNumber) missing.push('one number');
      if (!passwordValidation.hasSpecialChar) missing.push('one special character');
      newErrors.newPassword = `Password must contain ${missing.join(', ')}`;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await authAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      // Update company details
      await companyAPI.update(user.company.id, companyData);
      
      // Upload logo if file selected
      if (logoFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);
        await companyAPI.uploadLogo(user.company.id, formData);
      }
      
      toast.success('Company profile updated successfully');
      
      // Reload user data to get updated company info
      const response = await authAPI.getMe();
      updateUser(response.data.user);
      
      setLogoFile(null);
      setErrors({});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update company profile');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'Admin': return 'error';
      case 'Project Manager': return 'warning';
      case 'Team Member': return 'success';
      case 'Sales/Finance': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account and company information</p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getRoleBadgeVariant(user?.role)}>
                  {user?.role}
                </Badge>
                {user?.company && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    at {user.company.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`${
              activeTab === 'password'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Change Password
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`${
              activeTab === 'company'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Company Profile
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  error={errors.firstName}
                  required
                  placeholder="First name"
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  error={errors.lastName}
                  required
                  placeholder="Last name"
                />
              </div>

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                error={errors.email}
                required
                placeholder="your@email.com"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">
                    {user?.role}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hourly Rate
                  </label>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">
                    ₹{parseFloat(user?.hourly_rate || 0).toFixed(2)}/hour
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={loading} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  error={errors.currentPassword}
                  required
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <Input
                  label="New Password"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  error={errors.newPassword}
                  required
                  placeholder="Enter new password"
                />
                <PasswordStrengthIndicator password={passwordData.newPassword} />
              </div>

              <div>
                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  error={errors.confirmPassword}
                  required
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Show passwords
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Security Tip:</strong> Choose a strong password that is at least 8 characters long and includes uppercase letters, lowercase letters, numbers, and special characters.
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={loading} disabled={loading}>
                  <Shield className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Company Tab */}
      {activeTab === 'company' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Company Profile
              {user?.role !== 'Admin' && (
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">(View Only)</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCompanySubmit} className="space-y-6">
              {/* Company Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Logo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Company Logo" className="h-full w-full object-contain" />
                    ) : (
                      <Building2 className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  {user?.role === 'Admin' && (
                    <div>
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <label htmlFor="logo-upload">
                        <Button type="button" variant="secondary" onClick={() => document.getElementById('logo-upload').click()}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  name="name"
                  value={companyData.name}
                  onChange={handleCompanyChange}
                  error={errors.name}
                  required
                  placeholder="Company name"
                  readOnly={user?.role !== 'Admin'}
                  className={user?.role !== 'Admin' ? 'bg-gray-50 dark:bg-gray-700' : ''}
                />
                <Input
                  label="Country"
                  name="country"
                  value={companyData.country}
                  onChange={handleCompanyChange}
                  required
                  placeholder="Country"
                  readOnly={user?.role !== 'Admin'}
                  className={user?.role !== 'Admin' ? 'bg-gray-50 dark:bg-gray-700' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Address
                </label>
                <textarea
                  name="address"
                  value={companyData.address}
                  onChange={handleCompanyChange}
                  placeholder="Enter company address"
                  readOnly={user?.role !== 'Admin'}
                  rows={3}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    user?.role !== 'Admin' ? 'bg-gray-50 dark:bg-gray-700' : ''
                  }`}
                />
              </div>

              {user?.role === 'Admin' && (
                <div className="flex justify-end">
                  <Button type="submit" loading={loading} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Update Company Profile
                  </Button>
                </div>
              )}

              {user?.role !== 'Admin' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Only administrators can edit company information. Contact your admin if changes are needed.
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
