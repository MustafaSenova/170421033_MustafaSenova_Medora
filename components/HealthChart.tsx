import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LineChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import Typo from './Typo';
import { colors, spacingX, spacingY } from '@/constants/theme';

const screenWidth = Dimensions.get('window').width;
// Padding ve margin'ları çıkararak güvenli chart genişliği hesapla
const chartWidth = screenWidth - (spacingX._40 + spacingX._30); // container padding + extra margin

interface HealthChartProps {
  title: string;
  data: number[];
  labels?: string[];
  type: 'line' | 'bar' | 'progress';
  color?: string;
  unit?: string;
  target?: number;
  showValues?: boolean;
}

const HealthChart: React.FC<HealthChartProps> = ({
  title,
  data,
  labels,
  type,
  color = colors.primary,
  unit = '',
  target,
  showValues = false,
}) => {
  // Son 7 günün verilerini al
  const recentData = data.slice(-7);
  const recentLabels = labels ? labels.slice(-7) : 
    Array.from({ length: recentData.length }, (_, i) => `${i + 1}`);

  // Chart config
  const chartConfig = {
    backgroundColor: colors.neutral800,
    backgroundGradientFrom: colors.neutral800,
    backgroundGradientTo: colors.neutral700,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${hexToRgb(color)}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.7})`,
    style: {
      borderRadius: 12,
    },
    propsForDots: {
      r: '3',
      strokeWidth: '2',
      stroke: color,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: `rgba(255, 255, 255, 0.1)`,
    },
    fillShadowGradient: color,
    fillShadowGradientOpacity: 0.1,
  };

  // Hex to RGB converter
  function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `${r}, ${g}, ${b}`;
    }
    return '255, 255, 255'; // fallback to white
  }

  // Line chart data
  const lineChartData = {
    labels: recentLabels,
    datasets: [{
      data: recentData,
      color: (opacity = 1) => `rgba(${hexToRgb(color)}, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  // Bar chart data
  const barChartData = {
    labels: recentLabels,
    datasets: [{
      data: recentData,
    }],
  };

  // Progress chart data (for targets)
  const progressData = target ? {
    labels: ['Hedef'],
    data: [Math.min(recentData[recentData.length - 1] / target, 1)],
  } : {
    labels: ['Değer'],
    data: [0.5],
  };

  // Latest value
  const latestValue = recentData[recentData.length - 1];
  const average = recentData.reduce((sum, val) => sum + val, 0) / recentData.length;

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <View style={styles.chartContainer}>
            <LineChart
              data={lineChartData}
              width={chartWidth}
              height={160}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withHorizontalLabels={true}
              withVerticalLabels={true}
              withInnerLines={false}
              withOuterLines={false}
            />
          </View>
        );
      case 'bar':
        return (
          <View style={styles.chartContainer}>
            <BarChart
              data={barChartData}
              width={chartWidth}
              height={160}
              chartConfig={chartConfig}
              style={styles.chart}
              withHorizontalLabels={true}
              withInnerLines={false}
              withOuterLines={false}
              showValuesOnTopOfBars={false}
            />
          </View>
        );
      case 'progress':
        return (
          <View style={styles.progressContainer}>
            <ProgressChart
              data={progressData}
              width={chartWidth}
              height={100}
              strokeWidth={12}
              radius={28}
              chartConfig={chartConfig}
              hideLegend={true}
              style={styles.progressChart}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typo size={16} fontWeight="600">{title}</Typo>
        {showValues && (
          <View style={styles.values}>
            <Typo size={14} color={colors.textLighter}>
              Son: {latestValue.toFixed(0)}{unit}
            </Typo>
            <Typo size={12} color={colors.textLighter}>
              Ort: {average.toFixed(0)}{unit}
            </Typo>
          </View>
        )}
      </View>
      
      {renderChart()}
      
      {target && type === 'progress' && (
        <View style={styles.targetInfo}>
          <Typo size={12} color={colors.textLighter}>
            Hedef: {target}{unit} • Mevcut: {latestValue.toFixed(0)}{unit}
          </Typo>
          <Typo size={12} color={latestValue >= target ? colors.green : colors.rose}>
            {latestValue >= target ? 'Hedefe ulaşıldı!' : `${(target - latestValue).toFixed(0)} kaldı`}
          </Typo>
        </View>
      )}
    </View>
  );
};

export default HealthChart;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral800,
    borderRadius: 12,
    padding: spacingY._15,
    marginBottom: spacingY._15,
    overflow: 'hidden', // Chart taşmasını önle
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._10,
  },
  values: {
    alignItems: 'flex-end',
  },
  chartContainer: {
    alignItems: 'center',
    overflow: 'hidden',
  },
  chart: {
    borderRadius: 8,
    marginVertical: spacingY._5,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacingY._10,
  },
  progressChart: {
    borderRadius: 8,
  },
  targetInfo: {
    marginTop: spacingY._10,
    alignItems: 'center',
  },
}); 