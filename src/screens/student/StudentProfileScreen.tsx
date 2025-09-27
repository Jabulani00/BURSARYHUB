import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList, StudentProfile, StudentProfileForm } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { updateUserProfile } from '../../store/slices/userSlice';

// Components
import Header from '../../components/shared/Header';
import Input from '../../components/shared/Input';
import Button from '../../components/shared/Button';
import Card from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';

type StudentProfileNavigationProp = NativeStackNavigationProp<StudentStackParamList, 'StudentProfile'>;

const StudentProfileScreen: React.FC = () => {
  const navigation = useNavigation<StudentProfileNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, loading } = useSelector((state: RootState) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StudentProfileForm>({
    dateOfBirth: '',
    institution: '',
    fieldOfStudy: '',
    level: 'undergraduate',
  });

  const [formErrors, setFormErrors] = useState<Partial<StudentProfileForm>>({});

  useEffect(() => {
    if (currentUser?.profileData) {
      const profile = currentUser.profileData as StudentProfile;
      setFormData({
        dateOfBirth: profile.dateOfBirth || '',
        institution: profile.institution || '',
        fieldOfStudy: profile.fieldOfStudy || '',
        level: profile.level || 'undergraduate',
      });
    }
  }, [currentUser]);

  const validateForm = (): boolean => {
    const errors: Partial<StudentProfileForm> = {};

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.institution.trim()) {
      errors.institution = 'Institution is required';
    }

    if (!formData.fieldOfStudy.trim()) {
      errors.fieldOfStudy = 'Field of study is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const profileData: StudentProfile = {
        ...formData,
        documents: (currentUser?.profileData as StudentProfile)?.documents || {},
      };

      await dispatch(updateUserProfile(profileData)).unwrap();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleInputChange = (field: keyof StudentProfileForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDocumentUpload = (documentType: keyof StudentProfile['documents']) => {
    // TODO: Implement document upload
    Alert.alert('Coming Soon', 'Document upload will be available soon');
  };

  const getDocumentStatus = (documentType: keyof StudentProfile['documents']) => {
    const documents = (currentUser?.profileData as StudentProfile)?.documents;
    return documents?.[documentType] ? 'Uploaded' : 'Not uploaded';
  };

  const getDocumentStatusColor = (documentType: keyof StudentProfile['documents']) => {
    const documents = (currentUser?.profileData as StudentProfile)?.documents;
    return documents?.[documentType] ? '#4CAF50' : '#F44336';
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  return (
    <View style={styles.container}>
      <Header title="My Profile" showBackButton />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#757575" />
            </View>
          </View>
          <Text style={styles.userName}>{currentUser?.name}</Text>
          <Text style={styles.userEmail}>{currentUser?.email}</Text>
          <Text style={styles.userRole}>Student</Text>
        </Card>

        {/* Profile Information */}
        <Card style={styles.profileCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Profile Information</Text>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              style={styles.editButton}
            >
              <Ionicons 
                name={isEditing ? "close" : "pencil"} 
                size={20} 
                color="#8B5CF6" 
              />
              <Text style={styles.editButtonText}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Input
              label="Date of Birth"
              placeholder="DD/MM/YYYY"
              value={formData.dateOfBirth}
              onChangeText={(value) => handleInputChange('dateOfBirth', value)}
              error={formErrors.dateOfBirth}
              editable={isEditing}
              leftIcon="calendar"
            />

            <Input
              label="Institution"
              placeholder="Enter your institution"
              value={formData.institution}
              onChangeText={(value) => handleInputChange('institution', value)}
              error={formErrors.institution}
              editable={isEditing}
              leftIcon="school"
            />

            <Input
              label="Field of Study"
              placeholder="Enter your field of study"
              value={formData.fieldOfStudy}
              onChangeText={(value) => handleInputChange('fieldOfStudy', value)}
              error={formErrors.fieldOfStudy}
              editable={isEditing}
              leftIcon="book"
            />

            <View style={styles.levelContainer}>
              <Text style={styles.levelLabel}>Level</Text>
              <View style={styles.levelOptions}>
                <TouchableOpacity
                  style={[
                    styles.levelOption,
                    formData.level === 'undergraduate' && styles.selectedLevelOption
                  ]}
                  onPress={() => handleInputChange('level', 'undergraduate')}
                  disabled={!isEditing}
                >
                  <Text style={[
                    styles.levelOptionText,
                    formData.level === 'undergraduate' && styles.selectedLevelOptionText
                  ]}>
                    Undergraduate
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.levelOption,
                    formData.level === 'postgraduate' && styles.selectedLevelOption
                  ]}
                  onPress={() => handleInputChange('level', 'postgraduate')}
                  disabled={!isEditing}
                >
                  <Text style={[
                    styles.levelOptionText,
                    formData.level === 'postgraduate' && styles.selectedLevelOptionText
                  ]}>
                    Postgraduate
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {isEditing && (
              <Button
                title="Save Changes"
                onPress={handleSave}
                fullWidth
                style={styles.saveButton}
              />
            )}
          </View>
        </Card>

        {/* Documents */}
        <Card style={styles.documentsCard}>
          <Text style={styles.cardTitle}>Required Documents</Text>
          <Text style={styles.cardSubtitle}>
            Upload your documents to complete your profile
          </Text>

          <View style={styles.documentsList}>
            {[
              { key: 'idCardUrl', title: 'ID Document', icon: 'card' },
              { key: 'matricCertUrl', title: 'Matric Certificate', icon: 'document' },
              { key: 'transcriptUrl', title: 'Academic Transcript', icon: 'document-text' },
              { key: 'cvUrl', title: 'CV/Resume', icon: 'briefcase' },
            ].map((doc) => (
              <TouchableOpacity
                key={doc.key}
                style={styles.documentItem}
                onPress={() => handleDocumentUpload(doc.key as keyof StudentProfile['documents'])}
              >
                <View style={styles.documentInfo}>
                  <Ionicons name={doc.icon as any} size={24} color="#757575" />
                  <View style={styles.documentDetails}>
                    <Text style={styles.documentTitle}>{doc.title}</Text>
                    <Text style={[
                      styles.documentStatus,
                      { color: getDocumentStatusColor(doc.key as keyof StudentProfile['documents']) }
                    ]}>
                      {getDocumentStatus(doc.key as keyof StudentProfile['documents'])}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#757575" />
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    margin: 16,
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  profileCard: {
    margin: 16,
    marginTop: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    color: '#8B5CF6',
    marginLeft: 4,
  },
  form: {
    marginTop: 8,
  },
  levelContainer: {
    marginBottom: 16,
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  levelOptions: {
    flexDirection: 'row',
  },
  levelOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  selectedLevelOption: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  levelOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedLevelOptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  saveButton: {
    marginTop: 8,
  },
  documentsCard: {
    margin: 16,
    marginTop: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  documentsList: {
    marginTop: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentDetails: {
    marginLeft: 16,
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  documentStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default StudentProfileScreen;
