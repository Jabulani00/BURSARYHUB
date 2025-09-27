import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParamList, BursaryForm } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { createBursary } from '../../store/slices/bursarySlice';

// Components
import Header from '../../components/shared/Header';
import Input from '../../components/shared/Input';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';

type CreateBursaryNavigationProp = NativeStackNavigationProp<ProviderStackParamList, 'CreateBursary'>;

const CreateBursaryScreen: React.FC = () => {
  const navigation = useNavigation<CreateBursaryNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, loading } = useSelector((state: RootState) => state.user);

  const [formData, setFormData] = useState<BursaryForm>({
    title: '',
    description: '',
    requirements: [''],
    deadline: '',
    fieldOfStudy: [''],
    level: 'both',
    amount: undefined,
    duration: '',
    location: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<BursaryForm>>({});

  const validateForm = (): boolean => {
    const errors: Partial<BursaryForm> = {};

    if (!formData.title.trim()) {
      errors.title = 'Bursary title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.deadline) {
      errors.deadline = 'Deadline is required';
    } else if (new Date(formData.deadline) <= new Date()) {
      errors.deadline = 'Deadline must be in the future';
    }

    if (formData.requirements.length === 0 || formData.requirements.every(req => !req.trim())) {
      errors.requirements = 'At least one requirement is required';
    }

    if (formData.fieldOfStudy.length === 0 || formData.fieldOfStudy.every(field => !field.trim())) {
      errors.fieldOfStudy = 'At least one field of study is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!currentUser) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      const bursaryData = {
        ...formData,
        providerId: currentUser.id,
        providerName: currentUser.name,
        requirements: formData.requirements.filter(req => req.trim()),
        fieldOfStudy: formData.fieldOfStudy.filter(field => field.trim()),
      };

      await dispatch(createBursary(bursaryData)).unwrap();
      
      Alert.alert(
        'Success',
        'Bursary created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('BursaryManagement'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create bursary');
    }
  };

  const handleInputChange = (field: keyof BursaryForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index: number) => {
    if (formData.requirements.length > 1) {
      setFormData(prev => ({
        ...prev,
        requirements: prev.requirements.filter((_, i) => i !== index)
      }));
    }
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const addFieldOfStudy = () => {
    setFormData(prev => ({
      ...prev,
      fieldOfStudy: [...prev.fieldOfStudy, '']
    }));
  };

  const removeFieldOfStudy = (index: number) => {
    if (formData.fieldOfStudy.length > 1) {
      setFormData(prev => ({
        ...prev,
        fieldOfStudy: prev.fieldOfStudy.filter((_, i) => i !== index)
      }));
    }
  };

  const updateFieldOfStudy = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      fieldOfStudy: prev.fieldOfStudy.map((field, i) => i === index ? value : field)
    }));
  };

  if (loading) {
    return <LoadingSpinner text="Loading..." />;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="Create Bursary" showBackButton />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Input
              label="Bursary Title"
              placeholder="Enter bursary title"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              error={formErrors.title}
              leftIcon="school"
            />

            <Input
              label="Description"
              placeholder="Describe the bursary opportunity"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              error={formErrors.description}
              multiline
              numberOfLines={4}
              leftIcon="document-text"
            />

            <Input
              label="Deadline"
              placeholder="YYYY-MM-DD"
              value={formData.deadline}
              onChangeText={(value) => handleInputChange('deadline', value)}
              error={formErrors.deadline}
              leftIcon="calendar"
            />
          </View>

          {/* Financial Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financial Information</Text>
            
            <Input
              label="Amount (Optional)"
              placeholder="Enter bursary amount"
              value={formData.amount?.toString() || ''}
              onChangeText={(value) => handleInputChange('amount', value ? parseFloat(value) : undefined)}
              keyboardType="numeric"
              leftIcon="cash"
            />

            <Input
              label="Duration (Optional)"
              placeholder="e.g., 1 year, 2 semesters"
              value={formData.duration}
              onChangeText={(value) => handleInputChange('duration', value)}
              leftIcon="time"
            />
          </View>

          {/* Academic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Academic Information</Text>
            
            <View style={styles.levelContainer}>
              <Text style={styles.levelLabel}>Level</Text>
              <View style={styles.levelOptions}>
                <TouchableOpacity
                  style={[
                    styles.levelOption,
                    formData.level === 'undergraduate' && styles.selectedLevelOption
                  ]}
                  onPress={() => handleInputChange('level', 'undergraduate')}
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
                >
                  <Text style={[
                    styles.levelOptionText,
                    formData.level === 'postgraduate' && styles.selectedLevelOptionText
                  ]}>
                    Postgraduate
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.levelOption,
                    formData.level === 'both' && styles.selectedLevelOption
                  ]}
                  onPress={() => handleInputChange('level', 'both')}
                >
                  <Text style={[
                    styles.levelOptionText,
                    formData.level === 'both' && styles.selectedLevelOptionText
                  ]}>
                    Both
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldsContainer}>
              <Text style={styles.fieldsLabel}>Fields of Study</Text>
              {formData.fieldOfStudy.map((field, index) => (
                <View key={index} style={styles.fieldRow}>
                  <Input
                    placeholder="Enter field of study"
                    value={field}
                    onChangeText={(value) => updateFieldOfStudy(index, value)}
                    style={styles.fieldInput}
                  />
                  {formData.fieldOfStudy.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeFieldOfStudy(index)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={24} color="#F44336" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity onPress={addFieldOfStudy} style={styles.addButton}>
                <Ionicons name="add-circle" size={20} color="#8B5CF6" />
                <Text style={styles.addButtonText}>Add Field of Study</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Requirements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            {formData.requirements.map((requirement, index) => (
              <View key={index} style={styles.requirementRow}>
                <Input
                  placeholder="Enter requirement"
                  value={requirement}
                  onChangeText={(value) => updateRequirement(index, value)}
                  style={styles.requirementInput}
                />
                {formData.requirements.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeRequirement(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color="#F44336" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity onPress={addRequirement} style={styles.addButton}>
              <Ionicons name="add-circle" size={20} color="#8B5CF6" />
              <Text style={styles.addButtonText}>Add Requirement</Text>
            </TouchableOpacity>
          </View>

          {/* Additional Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            <Input
              label="Location (Optional)"
              placeholder="Enter location if applicable"
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              leftIcon="location"
            />
          </View>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <Button
              title="Create Bursary"
              onPress={handleSubmit}
              fullWidth
              style={styles.submitButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  formContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
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
    flexWrap: 'wrap',
  },
  levelOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
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
  fieldsContainer: {
    marginBottom: 16,
  },
  fieldsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldInput: {
    flex: 1,
    marginRight: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementInput: {
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#8B5CF6',
    marginLeft: 8,
    fontWeight: '500',
  },
  submitContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  submitButton: {
    marginBottom: 16,
  },
});

export default CreateBursaryScreen;
