import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList, BursaryFilters } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { fetchBursaries, setFilters, resetBursaries } from '../../store/slices/bursarySlice';

// Components
import Header from '../../components/shared/Header';
import BursaryCard from '../../components/shared/BursaryCard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import { Ionicons } from '@expo/vector-icons';

type BursaryListNavigationProp = NativeStackNavigationProp<StudentStackParamList, 'BursaryList'>;

const BursaryListScreen: React.FC = () => {
  const navigation = useNavigation<BursaryListNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { bursaries, loading, hasMore, filters } = useSelector((state: RootState) => state.bursaries);

  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadBursaries();
  }, []);

  const loadBursaries = async () => {
    // Only fetch if we don't have data or filters changed
    if (bursaries.length === 0) {
      await dispatch(fetchBursaries(filters));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    dispatch(resetBursaries());
    await loadBursaries();
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (hasMore && !loading) {
      await dispatch(fetchBursaries(filters));
    }
  };

  const handleFilterChange = (newFilters: BursaryFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(resetBursaries());
    loadBursaries();
  };

  const renderBursary = ({ item }: { item: any }) => (
    <BursaryCard
      bursary={item}
      onPress={() => navigation.navigate('BursaryDetails', { bursaryId: item.id })}
      showProvider={true}
      showDeadline={true}
      showAmount={true}
    />
  );

  const renderFooter = () => {
    if (loading && bursaries.length > 0) {
      return <LoadingSpinner size="small" />;
    }
    return null;
  };

  const renderEmpty = () => {
    if (loading && bursaries.length === 0) {
      return <LoadingSpinner text="Loading bursaries..." />;
    }

    return (
      <EmptyState
        icon="school-outline"
        title="No Bursaries Found"
        description="Try adjusting your filters or check back later for new opportunities"
        actionText="Clear Filters"
        onActionPress={() => handleFilterChange({})}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Bursaries" 
        rightComponent={
          <TouchableOpacity 
            onPress={() => setShowFilters(!showFilters)}
            style={styles.filterButton}
          >
            <Ionicons 
              name={showFilters ? "close" : "filter"} 
              size={24} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        }
      />
      
      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>Filter Bursaries</Text>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Field of Study</Text>
            <View style={styles.filterOptions}>
              {['Engineering', 'Medicine', 'Business', 'Arts', 'Science', 'Law'].map((field) => (
                <TouchableOpacity
                  key={field}
                  style={[
                    styles.filterOption,
                    filters.fieldOfStudy?.includes(field) && styles.selectedFilterOption
                  ]}
                  onPress={() => {
                    const currentFields = filters.fieldOfStudy || [];
                    const newFields = currentFields.includes(field)
                      ? currentFields.filter(f => f !== field)
                      : [...currentFields, field];
                    handleFilterChange({ ...filters, fieldOfStudy: newFields });
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.fieldOfStudy?.includes(field) && styles.selectedFilterOptionText
                  ]}>
                    {field}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Level</Text>
            <View style={styles.filterOptions}>
              {['undergraduate', 'postgraduate', 'both'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.filterOption,
                    filters.level === level && styles.selectedFilterOption
                  ]}
                  onPress={() => {
                    handleFilterChange({ 
                      ...filters, 
                      level: level === 'both' ? undefined : level as 'undergraduate' | 'postgraduate'
                    });
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.level === level && styles.selectedFilterOptionText
                  ]}>
                    {level === 'both' ? 'Both' : level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterActions}>
            <Button
              title="Clear All"
              onPress={() => handleFilterChange({})}
              variant="outline"
              size="small"
            />
            <Button
              title="Apply Filters"
              onPress={() => setShowFilters(false)}
              size="small"
            />
          </View>
        </View>
      )}

      <FlatList
        data={bursaries}
        renderItem={renderBursary}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filterButton: {
    padding: 8,
    marginRight: -8,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedFilterOption: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedFilterOptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
});

export default BursaryListScreen;
