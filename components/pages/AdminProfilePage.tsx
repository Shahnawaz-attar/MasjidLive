import * as React from 'react';
import { useState, useRef } from 'react';
import { User } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Label, Modal } from '../ui';
import { generateAvatarUrl } from '../../lib/avatar';
import dbService from '../../database/clientService';

const ChangePasswordModal = ({ userId, open, onClose }: { userId: string, open: boolean, onClose: () => void }) => {
  const [form, setForm] = React.useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = React.useState<{ type: 'success'|'error', text: string }|null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev=>({...prev,[e.target.name]:e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null); setLoading(true);
    if(form.newPassword!==form.confirm) {
      setMsg({type:'error',text:'Passwords do not match'}); setLoading(false); return;
    }
    try {
      await dbService.changePassword(userId, form.currentPassword, form.newPassword);
      setMsg({type:'success',text:'Password changed successfully.'});
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err: any) {
      setMsg({type:'error',text:err.message||'Error changing password'});
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Change Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input id="currentPassword" name="currentPassword" type="password" required value={form.currentPassword} onChange={handleChange} autoComplete="current-password" />
        </div>
        <div>
          <Label htmlFor="newPassword">New Password</Label>
          <Input id="newPassword" name="newPassword" type="password" required value={form.newPassword} onChange={handleChange} autoComplete="new-password" minLength={6} />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm New Password</Label>
          <Input id="confirm" name="confirm" type="password" required value={form.confirm} onChange={handleChange} autoComplete="new-password" minLength={6} />
        </div>
        {msg && (
          <div className={msg.type==='error' ? 'text-red-500 bg-red-100 px-3 py-1 rounded':'text-green-600 bg-green-50 px-3 py-1 rounded'}>{msg.text}</div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading?'Saving...':'Change Password'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export const AdminProfilePage = ({ user, onUserUpdate }: { user: User, onUserUpdate: (u: User) => void }) => {
    const [formData, setFormData] = React.useState({ name: user.name, email: user.email, avatar: user.avatar || '' });
    const [originalData, setOriginalData] = React.useState({ name: user.name, email: user.email, avatar: user.avatar || '' });
    const [editMode, setEditMode] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [showPwModal, setShowPwModal] = React.useState(false);
    const [hasChanges, setHasChanges] = React.useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        const userData = { name: user.name, email: user.email, avatar: user.avatar || '' };
        setFormData(userData);
        setOriginalData(userData);
        setHasChanges(false);
    }, [user]);

    // Check for changes whenever formData updates
    React.useEffect(() => {
        const hasDataChanges = 
            formData.name !== originalData.name || 
            formData.email !== originalData.email || 
            formData.avatar !== originalData.avatar;
        setHasChanges(hasDataChanges);
    }, [formData, originalData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = () => {
            setFormData(prev => ({ ...prev, avatar: reader.result as string }));
            setError(''); // Clear any previous errors
        };
        reader.readAsDataURL(file);
    };

    const handleCancel = () => {
        setEditMode(false);
        setFormData(originalData);
        setHasChanges(false);
        setError('');
        setSuccess('');
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasChanges) {
            setEditMode(false);
            return;
        }

        setLoading(true); 
        setError(''); 
        setSuccess('');
        
        try {
            const updated = await dbService.updateUser(user.id, formData);
            onUserUpdate({ ...user, ...updated });
            setOriginalData(formData); // Update original data to current
            setHasChanges(false);
            setSuccess('Profile updated successfully!');
            setEditMode(false);
        } catch (err: any) {
            setError(err.message || 'Error updating profile.');
        } finally { 
            setLoading(false); 
        }
    };

    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Manage your admin account details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
                <div className="flex flex-col items-center gap-4 mb-4">
                    <div className="relative group">
                        <img 
                            src={formData.avatar || generateAvatarUrl(formData.name)} 
                            alt="avatar" 
                            className={`w-24 h-24 object-cover rounded-full border-4 shadow transition-all duration-200 ${
                                hasChanges && editMode ? 'border-amber-300 ring-2 ring-amber-200' : 'border-primary/20'
                            }`}
                        />
                        {editMode && (<>
                          <input 
                            type="file" 
                            accept="image/jpeg,image/jpg,image/png,image/webp" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleAvatarChange}
                          />
                          <button 
                            type="button" 
                            onClick={()=>fileInputRef.current?.click()} 
                            className="absolute inset-0 bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center font-medium transition-opacity"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span className="text-xs mt-1">Change</span>
                          </button>
                        </>)}
                        {!editMode && (
                          <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-primary/90 transition-colors" onClick={() => setEditMode(true)}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </div>
                        )}
                    </div>
                    {hasChanges && editMode && (
                        <div className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                            Unsaved changes
                        </div>
                    )}
                </div>
                
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    disabled={!editMode} 
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    disabled={!editMode} 
                    className="mt-1"
                  />
                </div>
                
                {error && <div className="text-red-500 bg-red-100 rounded px-3 py-1 text-sm">{error}</div>}
                {success && <div className="text-green-600 bg-green-50 rounded px-3 py-1 text-sm">{success}</div>}
                
                <div className="flex gap-3 justify-end pt-2">
                   {editMode ? (
                     <>
                       <Button type="button" variant="outline" onClick={handleCancel}>
                         Cancel
                       </Button>
                       <Button 
                         type="submit" 
                         disabled={loading || !hasChanges}
                         className={hasChanges ? '' : 'opacity-50'}
                       >
                         {loading ? 'Saving...' : 'Save Changes'}
                       </Button>
                     </>
                   ) : (
                     <>
                       <Button type="button" onClick={()=>setShowPwModal(true)}>Change Password</Button>
                       <Button type="button" variant="outline" onClick={()=>setEditMode(true)}>Edit Profile</Button>
                     </>
                   )}
                </div>
            </form>
          </CardContent>
        </Card>
        <ChangePasswordModal userId={user.id} open={showPwModal} onClose={()=>setShowPwModal(false)}/>
      </div>
    );
};
