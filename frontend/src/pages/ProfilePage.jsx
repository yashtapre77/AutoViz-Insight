import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, CreditCard as Edit3, Save, X, Camera, ArrowLeft, Settings, Shield, Bell, Database, Activity, Award, TrendingUp } from 'lucide-react';

function ProfilePage({ onBack }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    joinDate: 'January 2023',
    bio: 'Data analyst passionate about turning complex datasets into actionable insights. Experienced in business intelligence and statistical analysis.',
    company: 'Tech Solutions Inc.',
    role: 'Senior Data Analyst'
  });

  const [editData, setEditData] = useState({ ...profileData });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...profileData });
  };

  const handleSave = () => {
    setProfileData({ ...editData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const stats = [
    { label: 'Datasets Uploaded', value: '24', icon: Database, color: 'text-[#00464B]' },
    { label: 'Analyses Completed', value: '47', icon: Activity, color: 'text-[#006B73]' },
    { label: 'Success Rate', value: '98.5%', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Achievements', value: '12', icon: Award, color: 'text-amber-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[#00464B] hover:text-[#003A3E] transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8">
          {/* Profile Header */}
          <div className="relative p-8 bg-gradient-to-r from-[#00464B] to-[#006B73] rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <User className="h-12 w-12 text-[#00464B]" />
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <Camera className="h-4 w-4 text-[#00464B]" />
                  </button>
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold">{profileData.name}</h2>
                  <p className="text-white/80">{profileData.role}</p>
                  <p className="text-white/60">{profileData.company}</p>
                </div>
              </div>
              <button
                onClick={isEditing ? handleCancel : handleEdit}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center gap-2"
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00464B]/20 focus:border-[#00464B] transition-colors duration-200"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{profileData.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00464B]/20 focus:border-[#00464B] transition-colors duration-200"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{profileData.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00464B]/20 focus:border-[#00464B] transition-colors duration-200"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{profileData.phone}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00464B]/20 focus:border-[#00464B] transition-colors duration-200"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{profileData.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Professional Information</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00464B]/20 focus:border-[#00464B] transition-colors duration-200"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">{profileData.company}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00464B]/20 focus:border-[#00464B] transition-colors duration-200"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">{profileData.role}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    {isEditing ? (
                      <textarea
                        value={editData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00464B]/20 focus:border-[#00464B] transition-colors duration-200 resize-none"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">{profileData.bio}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{profileData.joinDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-[#00464B] to-[#006B73] text-white font-medium rounded-lg hover:from-[#003A3E] hover:to-[#005A61] transition-all duration-200 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Settings Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Account Settings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#00464B]" />
              Account Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Two-factor authentication</span>
                <button className="px-3 py-1 text-sm bg-[#00464B] text-white rounded-md hover:bg-[#003A3E] transition-colors duration-200">
                  Enable
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Email notifications</span>
                <button className="px-3 py-1 text-sm bg-green-600 text-white rounded-md">
                  Enabled
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Data export</span>
                <button className="px-3 py-1 text-sm bg-[#00464B] text-white rounded-md hover:bg-[#003A3E] transition-colors duration-200">
                  Download
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#00464B]" />
              Privacy & Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Profile visibility</span>
                <select className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00464B]/20 focus:border-[#00464B]">
                  <option>Private</option>
                  <option>Public</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Data sharing</span>
                <button className="px-3 py-1 text-sm bg-red-600 text-white rounded-md">
                  Disabled
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Change password</span>
                <button className="px-3 py-1 text-sm bg-[#00464B] text-white rounded-md hover:bg-[#003A3E] transition-colors duration-200">
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;