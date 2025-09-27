import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Application } from '../../types';
import Card from './Card';

interface ApplicationCardProps {
  application: Application;
  onPress: () => void;
  showStudentInfo?: boolean;
  showBursaryInfo?: boolean;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onPress,
  showStudentInfo = true,
  showBursaryInfo = true,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'submitted':
        return '#FF9800';
      case 'under_review':
        return '#8B5CF6';
      case 'accepted':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'withdrawn':
        return '#757575';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'submitted':
        return 'time';
      case 'under_review':
        return 'eye';
      case 'accepted':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'withdrawn':
        return 'arrow-back-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusText = (status: Application['status']) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'under_review':
        return 'Under Review';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'withdrawn':
        return 'Withdrawn';
      default:
        return 'Unknown';
    }
  };

  const statusColor = getStatusColor(application.status);
  const statusIcon = getStatusIcon(application.status);
  const statusText = getStatusText(application.status);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            <Ionicons name={statusIcon} size={16} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {formatDate(application.submittedAt)}
          </Text>
        </View>

        {showBursaryInfo && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Bursary</Text>
            <Text style={styles.bursaryTitle}>{application.bursaryInfo.title}</Text>
            <Text style={styles.providerName}>{application.bursaryInfo.providerName}</Text>
            {application.bursaryInfo.amount && (
              <Text style={styles.amountText}>
                R{application.bursaryInfo.amount.toLocaleString()}
              </Text>
            )}
          </View>
        )}

        {showStudentInfo && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Applicant</Text>
            <Text style={styles.studentName}>{application.studentInfo.name}</Text>
            <View style={styles.studentDetails}>
              <Text style={styles.studentDetail}>
                {application.studentInfo.institution}
              </Text>
              <Text style={styles.studentDetail}>
                {application.studentInfo.fieldOfStudy}
              </Text>
              <Text style={styles.studentDetail}>
                {application.studentInfo.level}
              </Text>
            </View>
          </View>
        )}

        {application.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes:</Text>
            <Text style={styles.notesText}>{application.notes}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.updatedText}>
            Updated: {formatDate(application.updatedAt)}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#757575" />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 12,
    color: '#757575',
  },
  infoSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bursaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  providerName: {
    fontSize: 14,
    color: '#666',
  },
  amountText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 2,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  studentDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  studentDetail: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
    marginBottom: 2,
  },
  notesSection: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  updatedText: {
    fontSize: 12,
    color: '#757575',
  },
});

export default ApplicationCard;
