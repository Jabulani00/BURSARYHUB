import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types';

// Components
import Header from '../../components/shared/Header';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import { Ionicons } from '@expo/vector-icons';

type SystemSettingsNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'SystemSettings'>;

const SystemSettingsScreen: React.FC = () => {
  const navigation = useNavigation<SystemSettingsNavigationProp>();
  
  // System settings state
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    autoApproveProviders: false,
    maxApplicationsPerUser: 10,
    applicationDeadlineBuffer: 7, // days
    systemEmail: 'admin@bursaryhub.co.za',
    supportEmail: 'support@bursaryhub.co.za',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // TODO: Save settings to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              maintenanceMode: false,
              registrationEnabled: true,
              emailNotifications: true,
              autoApproveProviders: false,
              maxApplicationsPerUser: 10,
              applicationDeadlineBuffer: 7,
              systemEmail: 'admin@bursaryhub.co.za',
              supportEmail: 'support@bursaryhub.co.za',
            });
            Alert.alert('Success', 'Settings reset to default values');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="System Settings" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* System Status */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Maintenance Mode</Text>
              <Text style={styles.settingDescription}>
                Enable maintenance mode to temporarily disable the platform
              </Text>
            </View>
            <Switch
              value={settings.maintenanceMode}
              onValueChange={(value) => handleSettingChange('maintenanceMode', value)}
              trackColor={{ false: '#E0E0E0', true: '#8B5CF6' }}
              thumbColor={settings.maintenanceMode ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>User Registration</Text>
              <Text style={styles.settingDescription}>
                Allow new users to register on the platform
              </Text>
            </View>
            <Switch
              value={settings.registrationEnabled}
              onValueChange={(value) => handleSettingChange('registrationEnabled', value)}
              trackColor={{ false: '#E0E0E0', true: '#8B5CF6' }}
              thumbColor={settings.registrationEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </Card>

        {/* Application Settings */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Application Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-approve Providers</Text>
              <Text style={styles.settingDescription}>
                Automatically approve new provider registrations
              </Text>
            </View>
            <Switch
              value={settings.autoApproveProviders}
              onValueChange={(value) => handleSettingChange('autoApproveProviders', value)}
              trackColor={{ false: '#E0E0E0', true: '#8B5CF6' }}
              thumbColor={settings.autoApproveProviders ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <Input
            label="Max Applications Per User"
            placeholder="Enter maximum number"
            value={settings.maxApplicationsPerUser.toString()}
            onChangeText={(value) => handleSettingChange('maxApplicationsPerUser', parseInt(value) || 0)}
            keyboardType="numeric"
            leftIcon="document-text"
          />

          <Input
            label="Application Deadline Buffer (Days)"
            placeholder="Enter number of days"
            value={settings.applicationDeadlineBuffer.toString()}
            onChangeText={(value) => handleSettingChange('applicationDeadlineBuffer', parseInt(value) || 0)}
            keyboardType="numeric"
            leftIcon="time"
          />
        </Card>

        {/* Email Settings */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Email Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Text style={styles.settingDescription}>
                Send email notifications to users
              </Text>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={(value) => handleSettingChange('emailNotifications', value)}
              trackColor={{ false: '#E0E0E0', true: '#8B5CF6' }}
              thumbColor={settings.emailNotifications ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <Input
            label="System Email"
            placeholder="Enter system email address"
            value={settings.systemEmail}
            onChangeText={(value) => handleSettingChange('systemEmail', value)}
            keyboardType="email-address"
            leftIcon="mail"
          />

          <Input
            label="Support Email"
            placeholder="Enter support email address"
            value={settings.supportEmail}
            onChangeText={(value) => handleSettingChange('supportEmail', value)}
            keyboardType="email-address"
            leftIcon="help-circle"
          />
        </Card>

        {/* Security Settings */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          
          <TouchableOpacity style={styles.securityItem}>
            <View style={styles.securityInfo}>
              <Ionicons name="shield" size={24} color="#8B5CF6" />
              <View style={styles.securityDetails}>
                <Text style={styles.securityLabel}>Password Policy</Text>
                <Text style={styles.securityDescription}>
                  Configure password requirements and policies
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.securityItem}>
            <View style={styles.securityInfo}>
              <Ionicons name="lock-closed" size={24} color="#8B5CF6" />
              <View style={styles.securityDetails}>
                <Text style={styles.securityLabel}>Two-Factor Authentication</Text>
                <Text style={styles.securityDescription}>
                  Enable 2FA for admin accounts
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.securityItem}>
            <View style={styles.securityInfo}>
              <Ionicons name="key" size={24} color="#8B5CF6" />
              <View style={styles.securityDetails}>
                <Text style={styles.securityLabel}>API Keys</Text>
                <Text style={styles.securityDescription}>
                  Manage API keys and access tokens
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#757575" />
          </TouchableOpacity>
        </Card>

        {/* Backup & Maintenance */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Backup & Maintenance</Text>
          
          <TouchableOpacity style={styles.maintenanceItem}>
            <View style={styles.maintenanceInfo}>
              <Ionicons name="cloud-upload" size={24} color="#4CAF50" />
              <View style={styles.maintenanceDetails}>
                <Text style={styles.maintenanceLabel}>Create Backup</Text>
                <Text style={styles.maintenanceDescription}>
                  Create a system backup
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.maintenanceItem}>
            <View style={styles.maintenanceInfo}>
              <Ionicons name="refresh" size={24} color="#FF9800" />
              <View style={styles.maintenanceDetails}>
                <Text style={styles.maintenanceLabel}>Clear Cache</Text>
                <Text style={styles.maintenanceDescription}>
                  Clear system cache and temporary files
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.maintenanceItem}>
            <View style={styles.maintenanceInfo}>
              <Ionicons name="analytics" size={24} color="#9C27B0" />
              <View style={styles.maintenanceDetails}>
                <Text style={styles.maintenanceLabel}>System Logs</Text>
                <Text style={styles.maintenanceDescription}>
                  View and manage system logs
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#757575" />
          </TouchableOpacity>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Button
            title="Save Settings"
            onPress={handleSaveSettings}
            fullWidth
            loading={isSaving}
            style={styles.saveButton}
          />
          
          <Button
            title="Reset to Defaults"
            onPress={handleResetSettings}
            variant="outline"
            fullWidth
            style={styles.resetButton}
          />
        </View>
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
  section: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityDetails: {
    marginLeft: 16,
    flex: 1,
  },
  securityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 14,
    color: '#666',
  },
  maintenanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  maintenanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  maintenanceDetails: {
    marginLeft: 16,
    flex: 1,
  },
  maintenanceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  maintenanceDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionContainer: {
    padding: 16,
    paddingTop: 8,
  },
  saveButton: {
    marginBottom: 16,
  },
  resetButton: {
    marginBottom: 32,
  },
});

export default SystemSettingsScreen;
