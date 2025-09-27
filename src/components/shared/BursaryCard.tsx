import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Bursary } from '../../types';
import Card from './Card';

interface BursaryCardProps {
  bursary: Bursary;
  onPress: () => void;
  showProvider?: boolean;
  showDeadline?: boolean;
  showAmount?: boolean;
}

const BursaryCard: React.FC<BursaryCardProps> = ({
  bursary,
  onPress,
  showProvider = true,
  showDeadline = true,
  showAmount = true,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return 'Amount not specified';
    return `R${amount.toLocaleString()}`;
  };

  const getDaysUntilDeadline = (deadline: Date) => {
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days left`;
    return `${diffDays} days left`;
  };

  const getUrgencyColor = (deadline: Date) => {
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '#F44336'; // Expired - Red
    if (diffDays <= 3) return '#FF5722'; // Urgent - Deep Orange
    if (diffDays <= 7) return '#FF9800'; // Warning - Orange
    return '#4CAF50'; // Safe - Green
  };

  const isExpired = new Date(bursary.deadline) < new Date();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={[styles.card, isExpired && styles.expiredCard]}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {bursary.title}
          </Text>
          {isExpired && (
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredText}>Expired</Text>
            </View>
          )}
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {bursary.description}
        </Text>

        <View style={styles.details}>
          {showProvider && (
            <View style={styles.detailItem}>
              <Ionicons name="business" size={16} color="#757575" />
              <Text style={styles.detailText}>{bursary.providerName}</Text>
            </View>
          )}

          <View style={styles.detailItem}>
            <Ionicons name="school" size={16} color="#757575" />
            <Text style={styles.detailText}>
              {bursary.fieldOfStudy.join(', ')}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="person" size={16} color="#757575" />
            <Text style={styles.detailText}>
              {bursary.level === 'both' ? 'Undergraduate & Postgraduate' : bursary.level}
            </Text>
          </View>

          {showAmount && bursary.amount && (
            <View style={styles.detailItem}>
              <Ionicons name="cash" size={16} color="#4CAF50" />
              <Text style={[styles.detailText, styles.amountText]}>
                {formatAmount(bursary.amount)}
              </Text>
            </View>
          )}

          {showDeadline && (
            <View style={styles.detailItem}>
              <Ionicons 
                name="time" 
                size={16} 
                color={getUrgencyColor(bursary.deadline)} 
              />
              <Text style={[
                styles.detailText,
                isExpired && styles.expiredText
              ]}>
                {formatDate(bursary.deadline)} ({getDaysUntilDeadline(bursary.deadline)})
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.requirements}>
            <Text style={styles.requirementsText}>
              {bursary.requirements.length} requirement{bursary.requirements.length !== 1 ? 's' : ''}
            </Text>
            {bursary.location && (
              <Text style={styles.locationText}>
                📍 {bursary.location}
              </Text>
            )}
          </View>
          
          <View style={styles.arrow}>
            <Ionicons name="chevron-forward" size={20} color="#757575" />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
  },
  expiredCard: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  expiredBadge: {
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiredText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  amountText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  requirements: {
    flex: 1,
  },
  requirementsText: {
    fontSize: 12,
    color: '#757575',
  },
  locationText: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
  },
  arrow: {
    marginLeft: 8,
  },
});

export default BursaryCard;
