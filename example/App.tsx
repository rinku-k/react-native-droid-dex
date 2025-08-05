import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

import {
  initialize,
  getPerformanceLevel,
  getWeightedPerformanceLevel,
  startMonitoring,
  stopMonitoring,
  addPerformanceListener,
  removePerformanceListener,
  isSupported,
  getPlatformInfo,
  disableForProduction,
  isDisabledForProduction,
  PerformanceClass,
  PerformanceLevel,
  PerformanceResult,
  WeightedPerformanceClass,
} from 'react-native-droid-dex';

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [performanceResult, setPerformanceResult] = useState<PerformanceResult | null>(null);
  const [monitoringId, setMonitoringId] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [platformInfo, setPlatformInfo] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isProductionDisabled, setIsProductionDisabled] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  useEffect(() => {
    checkSupport();
  }, []);

  const checkSupport = async () => {
    const supported = isSupported();
    const disabled = isDisabledForProduction();
    setIsProductionDisabled(disabled);
    
    addLog(`Platform supported: ${supported}`);
    addLog(`Production disabled: ${disabled}`);
    
    if (supported) {
      try {
        const info = await getPlatformInfo();
        setPlatformInfo(info);
        addLog(`Platform info loaded: ${info.platform} ${info.version}`);
      } catch (error) {
        addLog(`Failed to get platform info: ${error}`);
      }
    }
  };

  const toggleProductionDisable = () => {
    const newState = !isProductionDisabled;
    disableForProduction(newState);
    setIsProductionDisabled(newState);
    addLog(`Production disable: ${newState ? 'enabled' : 'disabled'}`);
    
    if (newState && isInitialized) {
      // Reset initialization state when disabling
      setIsInitialized(false);
      if (isMonitoring && monitoringId) {
        handleStopMonitoring();
      }
    }
  };

  const handleInitialize = async () => {
    setIsLoading(true);
    try {
      const result = await initialize({
        debug: true,
        monitoringInterval: 3000,
      });
      
      setIsInitialized(true);
      addLog(`Initialized: ${JSON.stringify(result)}`);
      
      if (!result.fullFunctionality) {
        Alert.alert(
          'Limited Functionality',
          `Some features may not work due to missing permissions: ${result.missingPermissions?.join(', ')}`
        );
      }
    } catch (error) {
      addLog(`Initialization failed: ${error}`);
      Alert.alert('Error', `Failed to initialize: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetPerformanceLevel = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Please initialize first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await getPerformanceLevel(
        PerformanceClass.CPU,
        PerformanceClass.MEMORY,
        PerformanceClass.BATTERY
      );
      
      setPerformanceResult(result);
      addLog(`Performance level: ${result.level}`);
      
      if (result.unsupportedClasses?.length) {
        addLog(`Unsupported classes: ${result.unsupportedClasses.join(', ')}`);
      }
    } catch (error) {
      addLog(`Failed to get performance level: ${error}`);
      Alert.alert('Error', `Failed to get performance level: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetWeightedPerformanceLevel = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Please initialize first');
      return;
    }

    setIsLoading(true);
    try {
      const weightedClasses: WeightedPerformanceClass[] = [
        { performanceClass: PerformanceClass.MEMORY, weight: 2.0 },
        { performanceClass: PerformanceClass.CPU, weight: 1.5 },
        { performanceClass: PerformanceClass.BATTERY, weight: 1.0 },
      ];

      const result = await getWeightedPerformanceLevel(weightedClasses);
      
      setPerformanceResult(result);
      addLog(`Weighted performance level: ${result.level}`);
    } catch (error) {
      addLog(`Failed to get weighted performance level: ${error}`);
      Alert.alert('Error', `Failed to get weighted performance level: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMonitoring = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Please initialize first');
      return;
    }

    if (isMonitoring) {
      Alert.alert('Error', 'Monitoring is already active');
      return;
    }

    try {
      const id = await startMonitoring([
        PerformanceClass.CPU,
        PerformanceClass.MEMORY,
        PerformanceClass.BATTERY,
      ], 5000);

      setMonitoringId(id);
      setIsMonitoring(true);
      addLog(`Started monitoring with ID: ${id}`);

      addPerformanceListener(id, (result: PerformanceResult) => {
        setPerformanceResult(result);
        addLog(`Monitoring update: ${result.level}`);
      });

    } catch (error) {
      addLog(`Failed to start monitoring: ${error}`);
      Alert.alert('Error', `Failed to start monitoring: ${error}`);
    }
  };

  const handleStopMonitoring = async () => {
    if (!monitoringId) {
      Alert.alert('Error', 'No active monitoring');
      return;
    }

    try {
      await stopMonitoring(monitoringId);
      removePerformanceListener(monitoringId);
      
      setMonitoringId(null);
      setIsMonitoring(false);
      addLog('Stopped monitoring');
    } catch (error) {
      addLog(`Failed to stop monitoring: ${error}`);
      Alert.alert('Error', `Failed to stop monitoring: ${error}`);
    }
  };

  const getPerformanceLevelColor = (level: PerformanceLevel) => {
    switch (level) {
      case PerformanceLevel.EXCELLENT:
        return '#4CAF50';
      case PerformanceLevel.HIGH:
        return '#8BC34A';
      case PerformanceLevel.AVERAGE:
        return '#FF9800';
      case PerformanceLevel.LOW:
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>React Native DroidDex Example</Text>
        
        {platformInfo && (
          <View style={styles.platformInfo}>
            <Text style={styles.sectionTitle}>Platform Info</Text>
            <Text>Platform: {platformInfo.platform}</Text>
            {platformInfo.model && <Text>Device: {platformInfo.model}</Text>}
            {platformInfo.release && <Text>Version: {platformInfo.release} (API {platformInfo.version})</Text>}
            <Text>Supported: {platformInfo.supported ? 'Yes' : 'No'}</Text>
            {platformInfo.disabled && <Text style={styles.warningText}>Production Disabled: Yes</Text>}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Controls</Text>
          
          <TouchableOpacity
            style={[styles.button, isProductionDisabled ? styles.buttonWarning : styles.buttonSecondary]}
            onPress={toggleProductionDisable}
          >
            <Text style={styles.buttonText}>
              {isProductionDisabled ? 'Enable DroidDex' : 'Disable for Production'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, isInitialized && styles.buttonDisabled]}
            onPress={handleInitialize}
            disabled={isInitialized || isLoading}
          >
            <Text style={styles.buttonText}>
              {isInitialized ? 'Initialized ✓' : 'Initialize DroidDex'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, (!isInitialized || isLoading) && styles.buttonDisabled]}
            onPress={handleGetPerformanceLevel}
            disabled={!isInitialized || isLoading}
          >
            <Text style={styles.buttonText}>Get Performance Level</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, (!isInitialized || isLoading) && styles.buttonDisabled]}
            onPress={handleGetWeightedPerformanceLevel}
            disabled={!isInitialized || isLoading}
          >
            <Text style={styles.buttonText}>Get Weighted Performance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, (!isInitialized || isMonitoring || isLoading) && styles.buttonDisabled]}
            onPress={handleStartMonitoring}
            disabled={!isInitialized || isMonitoring || isLoading}
          >
            <Text style={styles.buttonText}>Start Monitoring</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, !isMonitoring && styles.buttonDisabled]}
            onPress={handleStopMonitoring}
            disabled={!isMonitoring}
          >
            <Text style={styles.buttonText}>Stop Monitoring</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text>Loading...</Text>
          </View>
        )}

        {performanceResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Result</Text>
            <View style={[styles.performanceLevel, { backgroundColor: getPerformanceLevelColor(performanceResult.level) }]}>
              <Text style={styles.performanceLevelText}>
                {performanceResult.level}
              </Text>
            </View>
            
            <Text style={styles.metricTitle}>Supported Classes:</Text>
            <Text>{performanceResult.supportedClasses?.join(', ')}</Text>
            
            {performanceResult.unsupportedClasses?.length && (
              <>
                <Text style={styles.metricTitle}>Unsupported Classes:</Text>
                <Text style={styles.warningText}>{performanceResult.unsupportedClasses.join(', ')}</Text>
              </>
            )}
            
            <Text style={styles.metricTitle}>Timestamp:</Text>
            <Text>{new Date(performanceResult.timestamp).toLocaleString()}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Log</Text>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logEntry}>
              {log}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  platformInfo: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonSecondary: {
    backgroundColor: '#607D8B',
  },
  buttonWarning: {
    backgroundColor: '#FF5722',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loading: {
    alignItems: 'center',
    padding: 20,
  },
  performanceLevel: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  performanceLevelText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    color: '#555',
  },
  warningText: {
    color: '#f44336',
  },
  logEntry: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});

export default App;